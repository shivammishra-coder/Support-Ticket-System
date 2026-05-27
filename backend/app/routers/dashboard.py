from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.ticket import TicketListOut
from app.core.dependencies import require_agent, require_admin
from app.services import ticket_service

router = APIRouter()


# GET /dashboard/agent
@router.get("/agent", response_model=list[TicketListOut])
def agent_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_agent),
):
    """
    Agent dashboard — returns the agent's own assigned
    open and in-progress tickets.
    """
    result = ticket_service.get_agent_dashboard(db, current_user)
    return result["tickets"]


#  GET /dashboard/admin
@router.get("/admin")
def admin_dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Admin dashboard — returns ticket counts grouped by status and priority.

    Response shape:
    {
        "total": 10,
        "by_status":   { "open": 3, "in_progress": 4, "resolved": 2, "closed": 1 },
        "by_priority": { "low": 2, "medium": 5, "high": 3 }
    }
    """
    return ticket_service.get_admin_dashboard(db)