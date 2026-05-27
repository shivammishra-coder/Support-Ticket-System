from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.ticket import TicketCreate, TicketOut, TicketListOut, StatusUpdate, AssignTicket
from app.core.dependencies import require_employee, require_agent, require_admin, get_current_user
from app.services import ticket_service

router = APIRouter()


#GET /tickets/
@router.get("/", response_model=list[TicketListOut])
def list_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    """
    - Employee  → their own tickets
    - Agent     → all open + in_progress, sorted by priority
    - Admin     → all tickets, sorted by priority
    """
    return ticket_service.list_tickets(db, current_user)


# POST /tickets/
@router.post("/", response_model=TicketOut, status_code=status.HTTP_201_CREATED)
def create_ticket(
    payload: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    """Employee creates a new ticket. Status always starts as 'open'."""
    return ticket_service.create_ticket(db, payload, current_user)


#GET /tickets/{id}
@router.get("/{ticket_id}", response_model=TicketOut)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    """
    Get ticket with public comments and status history.
    Employees can only view their own tickets.
    """
    return ticket_service.get_ticket_by_id(db, ticket_id, current_user)


# PUT /tickets/{id}/status
@router.put("/{ticket_id}/status", response_model=TicketOut)
def update_status(
    ticket_id: int,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent),
):
    """
    Update ticket status — validates transition via service layer.
    - Agent: must follow allowed transitions
    - Admin: can move to any status
    Returns 400 if transition is invalid (e.g. open → closed).
    """
    return ticket_service.update_ticket_status(db, ticket_id, payload.status, current_user)


#  PUT /tickets/{id}/assign
@router.put("/{ticket_id}/assign", response_model=TicketOut)
def assign_ticket(
    ticket_id: int,
    payload: AssignTicket,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent),
):
    """
    Assign ticket to a support agent.
    - Agent can only assign to themselves.
    - Admin can assign to any agent.
    """
    return ticket_service.assign_ticket(db, ticket_id, payload.assigned_to_id, current_user)