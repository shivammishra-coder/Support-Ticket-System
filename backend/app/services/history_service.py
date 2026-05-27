from sqlalchemy.orm import Session
from app.models.history import TicketHistory
from app.models.ticket import TicketStatus


def write_history(
    db: Session,
    ticket_id: int,
    changed_by_id: int,
    previous_status: TicketStatus,
    new_status: TicketStatus,
) -> TicketHistory:
    """
    Write an immutable history record for a status change.

    IMPORTANT: This must always be called INSIDE the same db transaction
    as the status update — never commit before calling this.
    The caller (ticket_service) handles the single db.commit().
    """
    entry = TicketHistory(
        ticket_id=ticket_id,
        changed_by_id=changed_by_id,
        previous_status=previous_status,
        new_status=new_status,
    )
    db.add(entry)
    # No db.commit() here — caller commits once for both changes
    return entry