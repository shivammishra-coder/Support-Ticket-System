from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.history import HistoryOut
from app.core.dependencies import require_employee
from app.services import ticket_service

router = APIRouter()


# GET /tickets/{id}/history
@router.get("/{ticket_id}/history", response_model=list[HistoryOut])
def get_ticket_history(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    """
    View the full immutable status history for a ticket.
    - Employees can only view history of their own tickets.
    - Agents and admins can view history of any ticket.

    NOTE: There is no PUT or DELETE endpoint for history — enforced at the router level.
    History is append-only and written only via the ticket service layer.
    """
    return ticket_service.get_ticket_history(db, ticket_id, current_user)