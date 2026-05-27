from pydantic import BaseModel, EmailStr
from app.models.user import UserRole


# Request schemas 

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRoleUpdate(BaseModel):
    role: UserRole


# Response schemas 

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole

    model_config = {"from_attributes": True}


#JWT schemas

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int | None = None
    role: UserRole | None = None