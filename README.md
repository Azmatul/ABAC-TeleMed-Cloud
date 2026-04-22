# 🚑 TeleMed ABAC — Secure Blockchain-Based Telemedicine System

![Status](https://img.shields.io/badge/status-active-success)
![Tech](https://img.shields.io/badge/stack-blockchain%20%7C%20fastapi%20%7C%20react-blue)
![License](https://img.shields.io/badge/license-academic-lightgrey)

> 🎓 **University Thesis Project**
> A decentralized telemedicine system leveraging **Blockchain + Attribute-Based Access Control (ABAC)** to ensure secure and transparent patient data sharing.

---

## 📌 Overview

Traditional telemedicine platforms often face critical issues such as:

* ❌ Unauthorized access to sensitive patient data
* ❌ Lack of transparency in permission handling
* ❌ Centralized data vulnerabilities

**TeleMed ABAC** addresses these challenges by combining:

* 🔗 **Blockchain** → Immutable & tamper-proof access control
* 🔐 **ABAC Model** → Fine-grained, attribute-driven authorization
* 🌐 **Full-Stack System** → Practical, real-world implementation

This project demonstrates how **smart contracts + modern web technologies** can build a **secure, decentralized healthcare system**.

---

## 🧠 Core Workflow

```text
User → Wallet Login → Registration → Admin Approval → Role Assigned (On-chain) → Secure Data Access
```

### Step-by-Step

1. 👤 User connects wallet (MetaMask)
2. 📝 Registers as **Doctor** or **Patient**
3. 🛡️ Admin approves role via smart contract
4. 🔑 Access permissions enforced using **on-chain ABAC policies**
5. 📂 Secure and auditable medical data access

---

## 🏗️ System Architecture

```
Frontend (React + Vite)
        ↓
Backend API (FastAPI)
        ↓
Blockchain (Solidity Smart Contract - ABAC)
```

---

## ⚙️ Technology Stack

### 🔗 Blockchain Layer

* **Solidity** – Smart contract logic (ABAC)
* **Hardhat** – Development & deployment
* **Ethereum (Localhost / Sepolia)** – Network
* **MetaMask** – Wallet authentication

### ⚙️ Backend Layer

* **FastAPI (Python)** – REST API
* **SQLite / PostgreSQL** – Data storage
* **Uvicorn** – Server runtime

### 🎨 Frontend Layer

* **React (Vite)** – UI framework
* **Tailwind CSS** – Styling
* **Viem** – Blockchain interaction

### 🧰 Tools

* Node.js & npm
* Python (venv)
* Git & GitHub

---

## ✨ Key Features

* 🔐 **On-chain Attribute-Based Access Control (ABAC)**
* 👥 Role management (**Admin / Doctor / Patient**)
* 🦊 Wallet-based authentication (MetaMask)
* 📜 Smart contract role assignment (`grantRole`)
* 📊 Transparent & auditable access system
* ⚡ Fully integrated **decentralized full-stack architecture**

---

## 🚀 Quick Start

### 1️⃣ Blockchain Setup

```bash
cd blockchain
npm install
npm run node
```

Open new terminal:

```bash
npm run deploy:local
```

---

### 2️⃣ Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

### 3️⃣ Frontend Setup

```bash
cd dapp-frontend
npm install
cp .env.local.example .env.local
npm run dev
```

---

### 4️⃣ MetaMask Configuration

* RPC URL: `http://127.0.0.1:8545`
* Chain ID: `31337`

---

## 📂 Project Structure

```
.
├── blockchain/      # Smart contracts (ABAC)
├── backend/         # FastAPI server
├── dapp-frontend/   # React frontend
└── README.md
```

---

## 🔍 API Endpoints

| Method | Endpoint       | Description         |
| ------ | -------------- | ------------------- |
| POST   | /register      | Create registration |
| GET    | /register      | Fetch all requests  |
| DELETE | /register/{id} | Delete registration |

---

## 🧪 Development Notes

* Uses **localStorage** for demo persistence
* Easily extendable to full DB-backed system
* Supports both **Localhost** and **Sepolia Testnet**

---

## 🔐 Security Perspective

* Access control logic enforced **on-chain**
* Eliminates centralized permission manipulation
* Provides **auditability & transparency**
* Reduces risk of unauthorized data exposure

---

## 🚧 Future Improvements

* 🔐 End-to-end encryption for medical records
* ☁️ IPFS for decentralized storage
* 📱 Mobile application support
* 🔔 Real-time notification system
* 🧾 Advanced audit dashboard

---

## 🎓 Academic Context

> **"A Blockchain-Based Attribute-Based Access Control System for Secure Patient Data Sharing in Telemedicine"**

This project is developed as part of an undergraduate thesis focusing on **privacy, security, and decentralized healthcare systems**.

---

## 🤝 Contribution

Contributions, suggestions, and improvements are welcome!
Feel free to fork the repo or open an issue.

---

## 📜 License

For **educational and research purposes only**.

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub!
