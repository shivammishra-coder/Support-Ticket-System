from sqlalchemy import Column, Integer, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    body = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False, nullable=False)

    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    ticket = relationship("Ticket", back_populates="comments")
    author = relationship("User", back_populates="comments")