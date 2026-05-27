"""
seed.py — Run this once to populate the database with test data.

Usage:
    cd backend
    python -m app.seed

Creates:
    - 1 admin
    - 2 support agents
    - 2 employees
    - 10 tickets spanning all priorities, statuses, and categories
    - Comments and history entries for realistic data
"""

from app.database import SessionLocal, engine
from app.models import user, ticket, comment, history  # noqa — registers all models
from app.database import Base
from app.models.user import User, UserRole
from app.models.ticket import Ticket, TicketStatus, TicketPriority, TicketCategory
from app.models.comment import Comment
from app.services.history_service import write_history
from app.core.security import hash_password

#  Create tables if not exists 
Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()

    try:
        # ── Guard: don't seed twice
        if db.query(User).first():
            print("⚠️  Database already has data. Skipping seed.")
            return

        print("🌱 Seeding database...")

        # USERS
        admin = User(
            name="Alice Admin",
            email="admin@company.com",
            hashed_password=hash_password("admin123"),
            role=UserRole.admin,
        )

        agent1 = User(
            name="Bob Agent",
            email="bob@company.com",
            hashed_password=hash_password("agent123"),
            role=UserRole.support_agent,
        )

        agent2 = User(
            name="Carol Agent",
            email="carol@company.com",
            hashed_password=hash_password("agent123"),
            role=UserRole.support_agent,
        )

        emp1 = User(
            name="Dave Employee",
            email="dave@company.com",
            hashed_password=hash_password("emp123"),
            role=UserRole.employee,
        )

        emp2 = User(
            name="Eve Employee",
            email="eve@company.com",
            hashed_password=hash_password("emp123"),
            role=UserRole.employee,
        )

        db.add_all([admin, agent1, agent2, emp1, emp2])
        db.flush()  # get IDs without committing

        print("  ✅ Users created")

        # TICKETS
        tickets_data = [
            # ( title, description, category, priority, status, created_by, assigned_to )
            (
                "Laptop won't turn on",
                "My laptop stopped working after the last Windows update. It powers on but shows a black screen.",
                TicketCategory.IT, TicketPriority.high, TicketStatus.open,
                emp1, None,
            ),
            (
                "Need VPN access for remote work",
                "I need VPN credentials set up to work from home starting next Monday.",
                TicketCategory.IT, TicketPriority.medium, TicketStatus.in_progress,
                emp1, agent1,
            ),
            (
                "Office chair is broken",
                "The armrest on my office chair snapped off. Requesting a replacement.",
                TicketCategory.Facilities, TicketPriority.low, TicketStatus.resolved,
                emp1, agent2,
            ),
            (
                "Payslip discrepancy for October",
                "My October payslip shows incorrect overtime hours. Please review and correct.",
                TicketCategory.HR, TicketPriority.high, TicketStatus.in_progress,
                emp2, agent1,
            ),
            (
                "Software license renewal",
                "Our Adobe Creative Cloud license expires in 2 weeks. Need renewal approval.",
                TicketCategory.IT, TicketPriority.high, TicketStatus.open,
                emp2, None,
            ),
            (
                "Request for standing desk",
                "I have a back condition and my doctor recommends a standing desk. Requesting ergonomic equipment.",
                TicketCategory.Facilities, TicketPriority.medium, TicketStatus.closed,
                emp2, agent2,
            ),
            (
                "Printer on floor 2 is jammed",
                "The shared printer on the second floor has been jammed since morning. Multiple people are affected.",
                TicketCategory.Facilities, TicketPriority.medium, TicketStatus.resolved,
                emp1, agent1,
            ),
            (
                "New employee onboarding access",
                "New hire starting Monday needs accounts set up: email, Slack, Jira, and GitHub.",
                TicketCategory.IT, TicketPriority.high, TicketStatus.in_progress,
                emp2, agent2,
            ),
            (
                "Leave policy clarification",
                "I need clarification on the carry-forward policy for unused annual leave.",
                TicketCategory.HR, TicketPriority.low, TicketStatus.open,
                emp1, None,
            ),
            (
                "AC not working in meeting room B",
                "The air conditioning in meeting room B has not been working for 3 days. Meetings are uncomfortable.",
                TicketCategory.Facilities, TicketPriority.medium, TicketStatus.closed,
                emp2, agent1,
            ),
        ]

        ticket_objects = []
        for title, desc, cat, pri, stat, created_by, assigned_to in tickets_data:
            t = Ticket(
                title=title,
                description=desc,
                category=cat,
                priority=pri,
                status=stat,
                created_by_id=created_by.id,
                assigned_to_id=assigned_to.id if assigned_to else None,
            )
            db.add(t)
            ticket_objects.append((t, stat))

        db.flush()  # get ticket IDs

        print("  ✅ Tickets created")

        # HISTORY — write realistic history for non-open tickets
        t1, t2, t3, t4, t5, t6, t7, t8, t9, t10 = [t for t, _ in ticket_objects]

        # Ticket 2: open → in_progress
        write_history(db, t2.id, agent1.id, TicketStatus.open, TicketStatus.in_progress)

        # Ticket 3: open → in_progress → resolved
        write_history(db, t3.id, agent2.id, TicketStatus.open, TicketStatus.in_progress)
        write_history(db, t3.id, agent2.id, TicketStatus.in_progress, TicketStatus.resolved)

        # Ticket 4: open → in_progress
        write_history(db, t4.id, agent1.id, TicketStatus.open, TicketStatus.in_progress)

        # Ticket 6: open → in_progress → resolved → closed
        write_history(db, t6.id, agent2.id, TicketStatus.open, TicketStatus.in_progress)
        write_history(db, t6.id, agent2.id, TicketStatus.in_progress, TicketStatus.resolved)
        write_history(db, t6.id, admin.id,  TicketStatus.resolved, TicketStatus.closed)

        # Ticket 7: open → in_progress → resolved
        write_history(db, t7.id, agent1.id, TicketStatus.open, TicketStatus.in_progress)
        write_history(db, t7.id, agent1.id, TicketStatus.in_progress, TicketStatus.resolved)

        # Ticket 8: open → in_progress
        write_history(db, t8.id, agent2.id, TicketStatus.open, TicketStatus.in_progress)

        # Ticket 10: open → in_progress → resolved → closed
        write_history(db, t10.id, agent1.id, TicketStatus.open, TicketStatus.in_progress)
        write_history(db, t10.id, agent1.id, TicketStatus.in_progress, TicketStatus.resolved)
        write_history(db, t10.id, admin.id,  TicketStatus.resolved, TicketStatus.closed)

        print("  ✅ History entries written")

        # COMMENTS
        comments_data = [
            # Ticket 2 — VPN access
            Comment(body="I have submitted the VPN request to IT infrastructure. Should be ready by Thursday.", is_internal=False, ticket_id=t2.id, author_id=agent1.id),
            Comment(body="Check if user needs split-tunnel or full-tunnel VPN before provisioning.", is_internal=True, ticket_id=t2.id, author_id=agent1.id),

            # Ticket 3 — Broken chair (resolved)
            Comment(body="Replacement chair has been ordered. Expected delivery in 3-5 business days.", is_internal=False, ticket_id=t3.id, author_id=agent2.id),
            Comment(body="Thank you! Looking forward to the new chair.", is_internal=False, ticket_id=t3.id, author_id=emp1.id),

            # Ticket 4 — Payslip
            Comment(body="I have flagged this with the payroll team. Will update you once reviewed.", is_internal=False, ticket_id=t4.id, author_id=agent1.id),
            Comment(body="Payroll confirmed the overtime hours were miscalculated. Fix will appear in November payslip.", is_internal=True, ticket_id=t4.id, author_id=agent1.id),

            # Ticket 7 — Printer
            Comment(body="Printer has been cleared and is back online.", is_internal=False, ticket_id=t7.id, author_id=agent1.id),

            # Ticket 8 — Onboarding
            Comment(body="Email and Slack accounts created. Working on Jira and GitHub access.", is_internal=False, ticket_id=t8.id, author_id=agent2.id),
            Comment(body="Need manager approval before granting GitHub org access.", is_internal=True, ticket_id=t8.id, author_id=agent2.id),
        ]

        db.add_all(comments_data)

        print("  ✅ Comments added")

        #  Single final commit
        db.commit()

        print("\n✅ Seed complete! Login credentials:")
        print("─" * 40)
        print("  Admin   → admin@company.com   / admin123")
        print("  Agent 1 → bob@company.com     / agent123")
        print("  Agent 2 → carol@company.com   / agent123")
        print("  Emp 1   → dave@company.com    / emp123")
        print("  Emp 2   → eve@company.com     / emp123")
        print("─" * 40)
        print(f"  Tickets : 10  (across all statuses + priorities)")
        print(f"  Comments: {len(comments_data)}")
        print(f"  History : 11 entries")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()