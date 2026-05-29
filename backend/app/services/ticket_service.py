from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.ticket import Ticket, TicketStatus, TicketPriority, TicketCategory
from app.models.user import User, UserRole
from app.schemas.ticket import TicketCreate
from app.services.history_service import write_history


# ── Allowed status transitions ───────────────────────────────
#
#   open ──► in_progress ──► resolved ──► closed
#                └──────────────────────► in_progress  (reopen)
#
ALLOWED_TRANSITIONS: dict[TicketStatus, list[TicketStatus]] = {
    TicketStatus.open:        [TicketStatus.in_progress],
    TicketStatus.in_progress: [TicketStatus.resolved, TicketStatus.closed],
    TicketStatus.resolved:    [TicketStatus.in_progress, TicketStatus.closed],
    TicketStatus.closed:      [],   # terminal state
}


# ── Helpers ──────────────────────────────────────────────────
def _get_ticket_or_404(db: Session, ticket_id: int) -> Ticket:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket {ticket_id} not found",
        )
    return ticket


def _validate_transition(current: TicketStatus, new: TicketStatus) -> None:
    """Raise 400 if the transition is not allowed."""
    if new not in ALLOWED_TRANSITIONS[current]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid transition: '{current}' → '{new}'. "
                f"Allowed: {[s.value for s in ALLOWED_TRANSITIONS[current]] or 'none (terminal state)'}"
            ),
        )


# ── Service functions ────────────────────────────────────────

def create_ticket(db: Session, payload: TicketCreate, current_user: User) -> Ticket:
    """Employee creates a new ticket — always starts as 'open'."""
    ticket = Ticket(
        title=payload.title,
        description=payload.description,
        category=payload.category,
        priority=payload.priority,
        status=TicketStatus.open,
        created_by_id=current_user.id,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


def get_ticket_by_id(db: Session, ticket_id: int, current_user: User) -> Ticket:
    """
    Fetch a single ticket.
    - Employees can only see their own tickets.
    - Agents and admins can see all tickets.
    """
    ticket = _get_ticket_or_404(db, ticket_id)

    if current_user.role == UserRole.employee and ticket.created_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own tickets",
        )
    return ticket


def list_tickets(db: Session, current_user: User) -> list[Ticket]:
    """
    - Employee  → only their own tickets
    - Agent     → all open + in_progress tickets, sorted by priority
    - Admin     → all tickets, sorted by priority
    """
    priority_order = {
        TicketPriority.high: 0,
        TicketPriority.medium: 1,
        TicketPriority.low: 2,
    }

    if current_user.role == UserRole.employee:
        tickets = (
            db.query(Ticket)
            .filter(Ticket.created_by_id == current_user.id)
            .all()
        )
    elif current_user.role == UserRole.support_agent:
        tickets = (
            db.query(Ticket)
            .filter(Ticket.status.in_([TicketStatus.open, TicketStatus.in_progress]))
            .all()
        )
    else:
        # admin sees everything
        tickets = db.query(Ticket).all()

    # Sort by priority (high → medium → low)
    tickets.sort(key=lambda t: priority_order.get(t.priority, 99))
    return tickets


def update_ticket_status(
    db: Session,
    ticket_id: int,
    new_status: TicketStatus,
    current_user: User,
) -> Ticket:
    """
    Validate transition, update ticket status, and write history —
    all inside a single transaction.
    - Agent: can only follow ALLOWED_TRANSITIONS
    - Admin: can move to any status regardless of current state
    """
    ticket = _get_ticket_or_404(db, ticket_id)
    previous_status = ticket.status

    if current_user.role == UserRole.support_agent:
        # Agent can only change status of tickets assigned to them
        if ticket.assigned_to_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only change status of tickets assigned to you",
            )
        _validate_transition(previous_status, new_status)
    elif current_user.role != UserRole.admin:
        _validate_transition(previous_status, new_status)

    # Update ticket
    ticket.status = new_status

    # Write history inside the SAME transaction (no commit yet)
    write_history(
        db=db,
        ticket_id=ticket.id,
        changed_by_id=current_user.id,
        previous_status=previous_status,
        new_status=new_status,
    )

    # Single commit covers both the status change and history entry
    db.commit()
    db.refresh(ticket)
    return ticket


def assign_ticket(
    db: Session,
    ticket_id: int,
    assigned_to_id: int,
    current_user: User,
) -> Ticket:
    """
    Assign a ticket to a support agent.
    - Agent can assign to themselves only.
    - Admin can assign to anyone.
    """
    ticket = _get_ticket_or_404(db, ticket_id)

    # Validate the target user exists and is an agent
    target_user = db.query(User).filter(User.id == assigned_to_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {assigned_to_id} not found",
        )
    if target_user.role not in (UserRole.support_agent, UserRole.admin):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket can only be assigned to a support agent or admin",
        )

    # Agent self-assign check
    if current_user.role == UserRole.support_agent and assigned_to_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agents can only assign tickets to themselves",
        )

    ticket.assigned_to_id = assigned_to_id
    db.commit()
    db.refresh(ticket)
    return ticket


def get_ticket_history(db: Session, ticket_id: int, current_user: User):
    """Return the full immutable history log for a ticket."""
    ticket = get_ticket_by_id(db, ticket_id, current_user)
    return ticket.history


def get_agent_dashboard(db: Session, current_user: User) -> dict:
    """Agent dashboard — their own assigned open + in_progress tickets."""
    tickets = (
        db.query(Ticket)
        .filter(
            Ticket.assigned_to_id == current_user.id,
            Ticket.status.in_([TicketStatus.open, TicketStatus.in_progress]),
        )
        .all()
    )
    return {"tickets": tickets}


def get_admin_dashboard(db: Session) -> dict:
    """Admin dashboard — ticket counts grouped by status and priority."""
    all_tickets = db.query(Ticket).all()

    by_status = {}
    for s in TicketStatus:
        by_status[s.value] = sum(1 for t in all_tickets if t.status == s)

    by_priority = {}
    for p in TicketPriority:
        by_priority[p.value] = sum(1 for t in all_tickets if t.priority == p)

    return {
        "total": len(all_tickets),
        "by_status": by_status,
        "by_priority": by_priority,
    }