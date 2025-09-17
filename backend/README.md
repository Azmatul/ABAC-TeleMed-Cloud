# TeleMed Backend (FastAPI)

## Quick start (SQLite default)
```bash
pip install -r requirements.txt
# or: python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Open Swagger: http://127.0.0.1:8000/docs

## PostgreSQL (optional)
- Create DB: `createdb telemed`
- Set `.env` with:
```
DATABASE_URL="postgresql+psycopg2://user:password@localhost:5432/telemed"
```
- Start server as above.
