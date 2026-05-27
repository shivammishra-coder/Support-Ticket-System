from sqlalchemy import Column, Integer, String, Enum as SAEnum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.models.ticket import TicketStatus


class TicketHistory(Base):
    __tablename__ = "ticket_history"

    id = Column(Integer, primary_key=True, index=True)

    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    changed_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    previous_status = Column(SAEnum(TicketStatus), nullable=False)
    new_status = Column(SAEnum(TicketStatus), nullable=False)

    changed_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    ticket = relationship("Ticket", back_populates="history")
    changed_by = relationship("User", back_populates="history_entries")