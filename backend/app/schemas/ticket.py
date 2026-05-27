from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.ticket import TicketStatus, TicketPriority, TicketCategory
from app.schemas.user import UserOut


# Request schemas

class TicketCreate(BaseModel):
    title: str
    description: str
    category: TicketCategory
    priority: TicketPriority = TicketPriority.medium


class StatusUpdate(BaseModel):
    status: TicketStatus


class AssignTicket(BaseModel):
    assigned_to_id: int


# Response schemas

class TicketOut(BaseModel):
    id: int
    title: str
    description: str
    category: TicketCategory
    priority: TicketPriority
    status: TicketStatus
    created_by: UserOut
    assigned_to: Optional[UserOut] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class TicketListOut(BaseModel):
    id: int
    title: str
    category: TicketCategory
    priority: TicketPriority
    status: TicketStatus
    created_by: UserOut
    assigned_to: Optional[UserOut] = None
    created_at: datetime

    model_config = {"from_attributes": True}