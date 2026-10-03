# 🚑 TeleMed ABAC Cloud  
### Secure Blockchain-Based Telemedicine with Containerized Cloud Architecture

![Status](https://img.shields.io/badge/status-active-success)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/frontend-React%20%7C%20Vite-61DAFB)
![Blockchain](https://img.shields.io/badge/blockchain-Solidity%20%7C%20Hardhat-purple)
![Database](https://img.shields.io/badge/database-PostgreSQL-336791)
![Docker](https://img.shields.io/badge/container-Docker-2496ED)
![License](https://img.shields.io/badge/license-academic-lightgrey)

> 🎓 **University Thesis Project — Extended with Cloud & DevOps Architecture**
>
> TeleMed ABAC is a blockchain-enabled telemedicine platform designed to demonstrate secure, transparent, and role-aware access to healthcare services using smart contracts, modern web technologies, containerization, and cloud-ready infrastructure.

---

## 📌 Overview

Healthcare systems handle highly sensitive information and require strict control over who can access patient-related resources.

Traditional centralized systems may face challenges such as:

- Unauthorized access to sensitive information
- Centralized permission management
- Limited transparency in authorization decisions
- Difficulty auditing role assignments and access changes
- Infrastructure scalability and deployment complexity

**TeleMed ABAC Cloud** explores a distributed approach by combining:

- 🔗 **Blockchain** for transparent and tamper-resistant role management
- 🔐 **Attribute / Role-Based Authorization Concepts** for controlled access
- ⚙️ **FastAPI** for backend services
- 🗄️ **PostgreSQL** for structured application data
- ⚛️ **React + Vite** for the user interface
- 🐳 **Docker & Docker Compose** for service isolation and orchestration
- ☁️ **Cloud-ready architecture** for future deployment on AWS or similar platforms

The project originally began as an undergraduate blockchain-based telemedicine thesis and is being extended into a more complete **Cloud Computing and DevOps-oriented system**.

---

# 🧠 Core Workflow

```text
User
  │
  ▼
Connect MetaMask Wallet
  │
  ▼
Register as Doctor / Patient
  │
  ▼
Registration Stored
  │
  ▼
Admin Reviews Request
  │
  ▼
Smart Contract Assigns Role
  │
  ▼
Role-Based Access Granted
  │
  ▼
Secure Telemedicine Services
```

### Application Flow

1. 👤 User connects a MetaMask wallet.
2. 📝 User submits a registration request as a **Doctor** or **Patient**.
3. 🗄️ Application data is managed through the FastAPI backend and PostgreSQL.
4. 🛡️ An administrator reviews registration requests.
5. 🔗 The smart contract assigns the appropriate blockchain role.
6. 🔑 The application checks authorization before allowing protected actions.
7. 📜 Blockchain transactions provide an auditable record of role assignment.

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      Web Browser     │
                         │   React + MetaMask   │
                         └──────────┬───────────┘
                                    │
                                    │ HTTP
                                    ▼
                         ┌──────────────────────┐
                         │      Frontend        │
                         │   React + Vite       │
                         │   Nginx Container    │
                         └──────────┬───────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌──────────────────────┐
                         │      Backend         │
                         │      FastAPI         │
                         │   Uvicorn Container  │
                         └───────┬──────┬───────┘
                                 │      │
                      SQL        │      │ Blockchain RPC
                                 │      │
                                 ▼      ▼
                  ┌─────────────────┐  ┌──────────────────┐
                  │   PostgreSQL    │  │     Hardhat      │
                  │    Database     │  │ Ethereum Network │
                  │   Container     │  │    Container     │
                  └─────────────────┘  └────────┬─────────┘
                                               │
                                               ▼
                                    ┌─────────────────────┐
                                    │ AccessControlABAC   │
                                    │  Solidity Contract  │
                                    └─────────────────────┘
```

---

# ☁️ Containerized Architecture

The system is divided into independent services:

```text
ABAC-TeleMed-Cloud
│
├── frontend
│   └── React + Vite + Nginx
│
├── backend
│   └── FastAPI + Uvicorn
│
├── db
│   └── PostgreSQL
│
└── blockchain
    └── Hardhat Local Ethereum Node
```

Docker Compose creates a shared internal network that allows services to communicate using service names.

Example:

```text
Backend → db:5432
Backend → blockchain:8545
Browser → localhost:3000
Browser → localhost:8000
MetaMask → localhost:8545
```

---

# ⚙️ Technology Stack

## 🔗 Blockchain

- **Solidity**
- **OpenZeppelin AccessControl**
- **Hardhat**
- **Ethereum-compatible JSON-RPC**
- **MetaMask**
- Local Hardhat Network
- Sepolia-ready architecture

---

## ⚙️ Backend

- **Python**
- **FastAPI**
- **SQLAlchemy**
- **Pydantic**
- **Uvicorn**
- **psycopg**
- REST API architecture
- Health-check endpoint

---

## 🗄️ Database

- **PostgreSQL 17**
- SQLAlchemy ORM
- Docker persistent volumes

Legacy development initially used SQLite before migration to PostgreSQL.

---

## 🎨 Frontend

- **React**
- **Vite**
- **Tailwind CSS**
- **Viem**
- **MetaMask**
- **Nginx**

---

## 🐳 DevOps & Infrastructure

- Docker
- Docker Compose
- Environment-variable configuration
- Multi-stage Docker builds
- Service isolation
- Persistent database volumes
- Container networking
- Health-check API
- Git & GitHub

---

# ✨ Key Features

- 🔐 Blockchain-based access control
- 👥 Admin, Doctor, and Patient roles
- 🦊 MetaMask wallet integration
- 📜 Smart-contract role assignment
- 🗄️ PostgreSQL-backed registration data
- ⚙️ FastAPI REST backend
- ⚛️ React-based user interface
- 🐳 Fully containerized development environment
- 🔄 Multi-service orchestration with Docker Compose
- 🩺 Backend health endpoint
- 🌐 Internal Docker service networking
- 🔍 Transparent blockchain role management
- ☁️ Cloud-ready system design

---

# 📂 Project Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── crud.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── requirements.txt
│   └── README.md
│
├── blockchain/
│   ├── contracts/
│   │   └── AccessControlABAC.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── Dockerfile
│   ├── hardhat.config.js
│   ├── package.json
│   └── package-lock.json
│
├── dapp-frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.mjs
│   └── index.html
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

# 🚀 Quick Start with Docker

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Azmatul/ABAC-TeleMed-Cloud.git
cd ABAC-TeleMed-Cloud
```

---

## 2️⃣ Create Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit:

```bash
nano .env
```

Example:

```env
# ======================================
# DATABASE
# ======================================

POSTGRES_DB=telemed
POSTGRES_USER=telemed
POSTGRES_PASSWORD=your_postgres_password

DATABASE_URL=postgresql+psycopg://telemed:your_postgres_password@db:5432/telemed


# ======================================
# BACKEND
# ======================================

BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

JWT_SECRET=your_generated_jwt_secret
JWT_ALGORITHM=HS256


# ======================================
# BLOCKCHAIN
# ======================================

ETHEREUM_RPC_URL=http://blockchain:8545
CHAIN_ID=31337

CONTRACT_ADDRESS=
PRIVATE_KEY=


# ======================================
# FRONTEND
# ======================================

VITE_API_URL=http://localhost:8000
VITE_CHAIN_ID=31337
```

Generate a JWT secret with:

```bash
openssl rand -hex 32
```

> ⚠️ Never commit the real `.env` file to Git.

---

## 3️⃣ Build and Start the Stack

```bash
docker compose up --build -d
```

Check running services:

```bash
docker compose ps
```

Expected services:

```text
telemed-db
telemed-backend
telemed-frontend
telemed-blockchain
```

---

# 🌐 Local Service URLs

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:8000` |
| Swagger API Docs | `http://localhost:8000/docs` |
| Backend Health | `http://localhost:8000/health` |
| Blockchain RPC | `http://localhost:8545` |
| PostgreSQL | `localhost:5432` |

---

# 🩺 Health Check

The backend exposes:

```http
GET /health
```

Example response:

```json
{
  "status": "healthy",
  "database": "connected"
}
```

Test with:

```bash
curl http://localhost:8000/health
```

---

# 🗄️ Verify PostgreSQL

Enter the PostgreSQL container:

```bash
docker exec -it telemed-db psql -U telemed -d telemed
```

List tables:

```sql
\dt
```

Example:

```text
public | registrations | table | telemed
```

Exit:

```sql
\q
```

---

# ⛓️ Verify Blockchain RPC

Check the Hardhat chain ID:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

Expected:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x7a69"
}
```

`0x7a69` = `31337`, the default local Hardhat chain ID.

---

# 🦊 MetaMask Configuration

Add a custom network:

```text
Network Name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH
```

Hardhat test accounts can be viewed with:

```bash
docker compose logs blockchain
```

> ⚠️ Hardhat test private keys are publicly known and must never be used with real funds or production networks.

---

# 🔍 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Backend status |
| `GET` | `/health` | Backend and database health |
| `POST` | `/register` | Create registration request |
| `GET` | `/register` | Retrieve registration requests |
| `DELETE` | `/register/{id}` | Delete registration request |

Interactive API documentation:

```text
http://localhost:8000/docs
```

---

# 🔐 Smart Contract

The core Solidity contract is:

```text
blockchain/contracts/AccessControlABAC.sol
```

The contract defines:

```text
DEFAULT_ADMIN_ROLE
DOCTOR_ROLE
PATIENT_ROLE
```

The contract deployer receives the default administrator role.

Users can request:

```text
DOCTOR
PATIENT
```

roles, while the administrator approves role assignments on-chain.

---

# 🐳 Docker Services

## Backend

Built from:

```text
backend/Dockerfile
```

Runs:

```text
FastAPI + Uvicorn
```

on:

```text
8000
```

---

## Frontend

Uses a multi-stage Docker build:

```text
Node.js
   ↓
Vite Production Build
   ↓
Nginx
```

The frontend is served through:

```text
localhost:3000
```

---

## Database

Uses:

```text
postgres:17
```

with persistent storage through:

```text
postgres_data
```

Docker volume.

---

## Blockchain

Runs a Hardhat Ethereum development node on:

```text
8545
```

with chain ID:

```text
31337
```

---

# 🔧 Useful Docker Commands

Start:

```bash
docker compose up -d
```

Rebuild:

```bash
docker compose up --build -d
```

View running containers:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs
```

Backend logs:

```bash
docker compose logs backend
```

Blockchain logs:

```bash
docker compose logs blockchain
```

Stop services:

```bash
docker compose down
```

Fresh rebuild:

```bash
docker compose build --no-cache
docker compose up -d
```

---

# 🔒 Security Considerations

The project demonstrates several security-oriented concepts:

- Blockchain-managed role assignment
- Wallet-based identity
- Environment-based secret management
- Isolated application services
- Database credential separation
- Restricted role approval through smart contracts
- Auditable blockchain transactions
- Secure secret exclusion using `.gitignore`

Production deployment would require additional measures such as:

- TLS / HTTPS
- Production secret manager
- Key rotation
- Database network isolation
- API authentication hardening
- Smart contract auditing
- Encryption of sensitive medical information
- Infrastructure firewall rules
- Role and permission reviews

---

# ☁️ Cloud & DevOps Roadmap

The project is being extended from a traditional academic prototype into a cloud-oriented architecture.

Planned improvements include:

- ☁️ AWS deployment
- 📦 Docker image registry
- 🔄 GitHub Actions CI/CD
- 🏗️ Terraform Infrastructure as Code
- 🩺 Container health checks
- 📊 Prometheus monitoring
- 📈 Grafana dashboards
- 📝 Centralized logging
- 🔐 Cloud secret management
- ⚖️ Load balancing
- 🌐 Reverse proxy and HTTPS
- 💾 Automated PostgreSQL backups
- ☸️ Kubernetes deployment
- 📦 Container orchestration

---

# 🗃️ Planned Storage Improvements

Future versions may integrate:

### IPFS

For decentralized medical document storage:

```text
Medical File
    ↓
Encryption
    ↓
IPFS
    ↓
CID
    ↓
Blockchain / Database Reference
```

The actual sensitive file should not be stored directly on-chain.

---

# 🚧 Future Improvements

- End-to-end encryption for medical records
- IPFS integration
- AWS cloud deployment
- CI/CD pipelines
- Terraform provisioning
- Kubernetes deployment
- Prometheus + Grafana monitoring
- Centralized application logging
- Advanced audit dashboard
- Emergency access workflow
- Token/session authentication
- Smart contract testing
- Automated integration tests
- Improved role and policy management
- Production-ready secret management

---

# 🎓 Academic Context

### Thesis Title

> **A Blockchain-Based Attribute-Based Access Control System for Secure Patient Data Sharing in Telemedicine**

The project was originally developed as an undergraduate thesis investigating the use of blockchain and access-control mechanisms for secure healthcare data sharing.

The cloud version extends that research by exploring:

```text
Blockchain
+
Backend Architecture
+
Containerization
+
Database Systems
+
Cloud Infrastructure
+
DevOps Practices
```

This allows the project to demonstrate both the original security research concept and modern cloud-native software engineering practices.

---

# 📚 Learning Objectives

This project provides practical experience with:

- Smart contract development
- Blockchain authorization
- REST API development
- PostgreSQL
- React application development
- Docker image creation
- Docker Compose
- Container networking
- Environment management
- Health monitoring
- Cloud architecture
- DevOps workflows

---

# ⚠️ Disclaimer

This project is intended for:

- Academic research
- Educational purposes
- Blockchain experimentation
- Cloud and DevOps learning

It is **not intended for real-world medical deployment without additional security, privacy, compliance, testing, and infrastructure hardening**.

---

# 🤝 Contributions

Suggestions, issues, and improvements are welcome.

You can:

- Open an issue
- Submit a pull request
- Fork the repository
- Propose architectural improvements

---

# 📜 License

This project is intended for **educational and academic research purposes**.

---

# 👨‍💻 Author

**Md. Azmatul Haque**

Computer Science & Engineering  
Blockchain • Backend Development • Cloud Computing • DevOps

---

## ⭐ Support

If this project is useful for your research, learning, or development, consider giving the repository a ⭐.
