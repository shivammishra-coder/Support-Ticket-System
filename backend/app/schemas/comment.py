from pydantic import BaseModel
from datetime import datetime
from app.schemas.user import UserOut


# Request schemas

class CommentCreate(BaseModel):
    body: str
    is_internal: bool = False


#Response schemas

class CommentOut(BaseModel):
    id: int
    body: str
    is_internal: bool
    author: UserOut
    ticket_id: int
    created_at: datetime

    model_config = {"from_attributes": True}