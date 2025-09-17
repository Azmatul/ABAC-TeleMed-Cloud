from pydantic import BaseModel

class RegistrationBase(BaseModel):
    address: str
    role: str
    note: str | None = None

class RegistrationCreate(RegistrationBase):
    pass

class Registration(RegistrationBase):
    id: int
    approved: bool
    class Config:
        from_attributes = True
