from sqlalchemy import Column, Integer, String, Enum as SAEnum
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    employee = "employee"
    support_agent = "support_agent"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.employee, nullable=False)

    # Relationships
    tickets_raised = relationship(
        "Ticket", foreign_keys="Ticket.created_by_id", back_populates="created_by"
    )
    tickets_assigned = relationship(
        "Ticket", foreign_keys="Ticket.assigned_to_id", back_populates="assigned_to"
    )
    comments = relationship("Comment", back_populates="author")
    history_entries = relationship("TicketHistory", back_populates="changed_by")