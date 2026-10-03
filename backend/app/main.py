from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from .database import Base, engine, SessionLocal
from . import crud, schemas, models
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TeleMed Backend")

# CORS for local dev (adjust for prod)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def root():
    return {"status": "ok"}

@app.post("/register", response_model=schemas.Registration)
def create_request(req: schemas.RegistrationCreate, db: Session = Depends(get_db)):
    return crud.create_request(db, req)

@app.get("/register", response_model=list[schemas.Registration])
def list_requests(db: Session = Depends(get_db)):
    return crud.get_requests(db)

@app.delete("/register/{req_id}")
def delete_request(req_id: int, db: Session = Depends(get_db)):
    crud.delete_request(db, req_id)
    return {"deleted": req_id}


@app.get("/health")
def health():
    db = SessionLocal()

    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception:
        return {
            "status": "unhealthy",
            "database": "disconnected"
        }

    finally:
        db.close()