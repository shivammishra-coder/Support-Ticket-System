from sqlalchemy import Column, Integer, String, Text, Enum as SAEnum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class TicketStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


class TicketPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TicketCategory(str, enum.Enum):
    IT = "IT"
    HR = "HR"
    Facilities = "Facilities"
    Other = "Other"


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(SAEnum(TicketCategory), nullable=False)
    priority = Column(SAEnum(TicketPriority), default=TicketPriority.medium, nullable=False)
    status = Column(SAEnum(TicketStatus), default=TicketStatus.open, nullable=False)

    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    created_by = relationship(
        "User", foreign_keys=[created_by_id], back_populates="tickets_raised"
    )
    assigned_to = relationship(
        "User", foreign_keys=[assigned_to_id], back_populates="tickets_assigned"
    )
    comments = relationship("Comment", back_populates="ticket", cascade="all, delete-orphan")
    history = relationship(
        "TicketHistory", back_populates="ticket", cascade="all, delete-orphan"
    )