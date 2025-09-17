# TeleMed ABAC — Full‑Stack Monorepo

A minimal telemedicine demo that uses **Attribute‑Based Access Control (ABAC)** on-chain, a FastAPI backend, and a React/Vite frontend.

**Layers**

```
blockchain/     Hardhat + Solidity (AccessControlABAC)
backend/        FastAPI + SQLite (optional PostgreSQL)
dapp-frontend/  React + Vite + Tailwind + viem
```

---

## Quick Start (Local Dev, TL;DR)

> Works the same on **Windows** and **Ubuntu** once prerequisites are installed.

1. **Start local chain & deploy**
   ```bash
   cd blockchain
   npm install
   npm run node          # keep running
   # new terminal
   npm run deploy:local  # writes abi + addresses into dapp-frontend/
   ```
2. **Run backend**
   ```bash
   cd backend
   python -m venv .venv && source .venv/bin/activate  # (Windows: .\.venv\Scripts\Activate.ps1)
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
3. **Run frontend**
   ```bash
   cd dapp-frontend
   npm install
   cp .env.local.example .env.local   # Windows PowerShell: Copy-Item .env.local.example .env.local
   npm run dev
   ```
4. **MetaMask**
   - Add **Localhost 8545** (chainId `31337`).  
   - Open http://localhost:5173, connect wallet.

---

## Full Setup

### Prerequisites

- **Node.js ≥ 18** and **npm**  
- **Python 3.10+** and **pip**  
- (Optional) **PostgreSQL** if you want a real DB in production
- **MetaMask** in your browser

#### Windows (PowerShell)
```powershell
winget install OpenJS.NodeJS.LTS
winget install Python.Python.3.11
winget install Git.Git
# Optional
winget install PostgreSQL.PostgreSQL
```

Verify:
```powershell
node -v
npm -v
python --version
pip --version
```

#### Ubuntu 22.04+
```bash
sudo apt update
sudo apt install -y curl build-essential python3 python3-venv python3-pip git
# Node.js via nvm (recommended)
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
nvm install --lts
node -v && npm -v
```

---

## 1) Blockchain (Hardhat)

```bash
cd blockchain
npm install
```

### Local node
```bash
npm run node
```
Leave this terminal open (Hardhat RPC at `http://127.0.0.1:8545`).

### Deploy to local
Open a **new** terminal in `blockchain/`:
```bash
npm run deploy:local
```
This writes artifacts used by the frontend:
- `dapp-frontend/src/lib/abi.json`
- `dapp-frontend/src/lib/contract-address.json`

### (Optional) Sepolia testnet

1. Copy env & fill **SEPOLIA_RPC_URL** and **PRIVATE_KEY**:
   - **Linux/macOS**
     ```bash
     cp .env.example .env
     ```
   - **Windows (PowerShell)**
     ```powershell
     Copy-Item .env.example .env
     ```

   **.env**
   ```ini
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<YOUR_KEY>
   PRIVATE_KEY=0x<YOUR_PRIVATE_KEY>
   ```

2. Deploy:
   ```bash
   npm run deploy:sepolia
   ```

---

## 2) Backend (FastAPI)

```bash
cd backend
python -m venv .venv
# Linux/macOS
source .venv/bin/activate
# Windows PowerShell
# .\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

**Run API**
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Docs: http://127.0.0.1:8000/docs

**Database**
- Default: SQLite file `telemed.db` in `backend/` (no env needed)
- PostgreSQL (optional):
  - Create DB and set in `backend/.env`:
    ```ini
    DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/telemed
    ```

**Endpoints**
- `POST /register` – `{address, role, note}` create pending request
- `GET /register` – list pending/approved requests
- `DELETE /register/{id}` – delete a request

> To wire frontend queue to backend, replace calls in `dapp-frontend/src/lib/registry.js` with `fetch()` to these endpoints.

---

## 3) Frontend (React + Vite)

```bash
cd dapp-frontend
npm install
```
Choose env:
- **Local Hardhat**
  - Linux/macOS: `cp .env.local.example .env.local`
  - Windows PS: `Copy-Item .env.local.example .env.local`
- **Sepolia**
  - Linux/macOS: `cp .env.sepolia.example .env.local`
  - Windows PS: `Copy-Item .env.sepolia.example .env.local`

Run:
```bash
npm run dev
```
Open http://localhost:5173

**Environment variables examples**

_Local chain (`dapp-frontend/.env.local`):_
```ini
VITE_CHAIN=localhost
VITE_RPC_HTTP=http://127.0.0.1:8545
```

_Sepolia (`dapp-frontend/.env.local`):_
```ini
VITE_CHAIN=sepolia
VITE_RPC_HTTP=https://sepolia.infura.io/v3/<YOUR_KEY>
```

---

## MetaMask Setup

**Localhost 8545**
- Network Name: `Hardhat`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency Symbol: `ETH`

**Sepolia**
- Select built‑in Sepolia network, ensure account has test ETH.

---

## App Flow

1. New wallet → **Login** → **Register** as _Doctor_ or _Patient_.
2. (Admin wallet) → **Admin Panel** → Approve request → on‑chain `grantRole`.
3. Role‑gated dashboards appear:
   - Patient: upload/view encrypted records, manage doctor approvals & audit log
   - Doctor: request access, view approved patients & encrypted records, add prescriptions

> Demo stores data in **localStorage**. To persist the request queue in DB, wire the frontend to the FastAPI endpoints.

---

## Scripts Reference

### Blockchain
- `npm run node` – start local Hardhat node
- `npm run deploy:local` – deploy to localhost, generate frontend artifacts
- `npm run deploy:sepolia` – deploy to Sepolia using `.env`

### Backend
- `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`

### Frontend
- `npm run dev` – Vite dev server
- `npm run build` – build to `dist/`
- `npm run preview` – preview build

---

## Troubleshooting

- **Role stays `NONE` / contracts not found**  
  Make sure you deployed _after_ starting the local node. Verify these exist:
  `dapp-frontend/src/lib/abi.json` and `contract-address.json`.

- **Wrong network in MetaMask**  
  For local: chainId must be `31337`. For Sepolia: use the built‑in network.

- **Port conflicts**  
  Hardhat: `8545`, Backend: `8000`, Frontend: `5173`.

- **Windows venv activation blocked**  
  Start PowerShell as Admin once:
  ```powershell
  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

- **CORS errors**  
  Ensure the backend runs on `127.0.0.1:8000` and Vite on `localhost:5173`. If still failing, enable CORSMiddleware in FastAPI.

---

## Production Notes (Very Brief)

- **Contracts**: deploy to a public network and keep addresses/ABI in the frontend.
- **Backend**: run with a prod server (e.g., `uvicorn`/`gunicorn` behind Nginx); set a real `DATABASE_URL`.
- **Frontend**: `npm run build` then serve `dapp-frontend/dist` via Nginx or any static host.

---

## Repo Layout

```
.
├─ blockchain/
│  ├─ contracts/
│  ├─ scripts/
│  └─ hardhat.config.ts
├─ backend/
│  ├─ app/
│  │  ├─ main.py
│  │  └─ ...
│  └─ requirements.txt
├─ dapp-frontend/
│  ├─ src/
│  ├─ index.html
│  └─ vite.config.ts
└─ README.md
```

---

## Sample `.gitignore` (root)

> Create a `.gitignore` at the **repo root** (and extra ones in subfolders if needed).

```
# Node / frontend / hardhat
node_modules/
dist/
.cache/
coverage/
typechain-types/

# Env / secrets
.env
.env.*
!.env.example
backend/.env
blockchain/.env
dapp-frontend/.env.local

# Python
backend/.venv/
__pycache__/
*.pyc
*.pyo
*.pyd

# SQLite
backend/telemed.db
*.sqlite3

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
debug.log

# OS/editor
.DS_Store
Thumbs.db
.vscode/
.idea/
*.swp
```

---

**Happy hacking!** 🎉
