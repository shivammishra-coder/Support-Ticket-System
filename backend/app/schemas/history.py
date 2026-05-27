from pydantic import BaseModel
from datetime import datetime
from app.models.ticket import TicketStatus
from app.schemas.user import UserOut


# Response schema (read-only — no request schema needed) 

class HistoryOut(BaseModel):
    id: int
    ticket_id: int
    previous_status: TicketStatus
    new_status: TicketStatus
    changed_by: UserOut
    changed_at: datetime

    model_config = {"from_attributes": True}