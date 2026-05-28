from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.comment import Comment
from app.models.ticket import Ticket
from app.schemas.comment import CommentCreate, CommentOut
from app.core.dependencies import require_employee

router = APIRouter()


#  POST /tickets/{id}/comments
@router.post("/{ticket_id}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def add_comment(
    ticket_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    """
    Add a comment to a ticket.

    - is_internal=False  → public comment, visible to everyone
    - is_internal=True   → internal note, visible to agents + admins only

    Rules:
    - Employees can only comment on their own open or in_progress tickets
    - Employees cannot post internal notes (is_internal forced to False)
    - Agents and admins can comment on any ticket
    """
    # Check ticket exists
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket {ticket_id} not found",
        )

    # Employee restrictions
    if current_user.role == UserRole.employee:
        if ticket.created_by_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only comment on your own tickets",
            )
        from app.models.ticket import TicketStatus
        if ticket.status not in (TicketStatus.open, TicketStatus.in_progress):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You can only comment on open or in-progress tickets",
            )
        # Force internal = False for employees
        is_internal = False
    else:
        is_internal = payload.is_internal

    comment = Comment(
        body=payload.body,
        is_internal=is_internal,
        ticket_id=ticket_id,
        author_id=current_user.id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


#  GET /tickets/{id}/comments
@router.get("/{ticket_id}/comments", response_model=list[CommentOut])
def get_comments(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    """
    Get all visible comments for a ticket.

    Rules:
    - Employees can only see public comments (`is_internal=False`) on their own tickets.
    - Support agents and admins can see all comments (including internal notes).
    """
    # Check ticket exists
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket {ticket_id} not found",
        )

    # Base query for this ticket's comments
    query = db.query(Comment).filter(Comment.ticket_id == ticket_id)

    # Apply visibility and access filters based on role
    if current_user.role == UserRole.employee:
        if ticket.created_by_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view comments on your own tickets",
            )
        # Employees only see non-internal comments
        query = query.filter(Comment.is_internal == False)

    # Sort comments by creation time (oldest first)
    comments = query.order_by(Comment.created_at.asc()).all()
    return comments    