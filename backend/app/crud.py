from sqlalchemy.orm import Session
from . import models, schemas

def create_request(db: Session, req: schemas.RegistrationCreate):
    db_req = models.Registration(address=req.address, role=req.role, note=req.note)
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req

def get_requests(db: Session):
    return db.query(models.Registration).order_by(models.Registration.created_at.desc()).all()

def delete_request(db: Session, req_id: int):
    row = db.query(models.Registration).filter(models.Registration.id == req_id).first()
    if row:
        db.delete(row)
        db.commit()
