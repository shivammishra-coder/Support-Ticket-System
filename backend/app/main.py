from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import user, ticket, comment, history  # noqa: F401 — registers all models

# Create all tables
Base.metadata.create_all(bind=engine)

#App instance
app = FastAPI(
    title="Support Ticket System",
    description="Internal help desk API — raise tickets, assign agents, track resolution",
    version="1.0.0",
)

#CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Routers
from app.routers import auth, tickets, comments, history, dashboard

app.include_router(auth.router,       prefix="/auth",       tags=["Auth"])
app.include_router(tickets.router,    prefix="/tickets",    tags=["Tickets"])
app.include_router(comments.router,   prefix="/tickets",    tags=["Comments"])
app.include_router(history.router,    prefix="/tickets",    tags=["History"])
app.include_router(dashboard.router,  prefix="/dashboard",  tags=["Dashboard"])


#Health check
@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Support Ticket System is running"}