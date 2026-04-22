# Hey This is my University Thesis base Project.
# 🚑 TeleMed ABAC — Secure Blockchain-Based Telemedicine System

A full-stack decentralized telemedicine application that uses **Attribute-Based Access Control (ABAC)** on blockchain to securely manage patient data sharing between doctors and patients.

---

## 📌 Overview

Traditional telemedicine systems suffer from **data privacy risks, unauthorized access, and lack of transparency**.

**TeleMed ABAC** solves these problems by integrating:

* 🔗 Blockchain for **tamper-proof access control**
* 🔐 ABAC for **fine-grained authorization**
* 🌐 Full-stack architecture for real-world usability

This project demonstrates how **smart contracts + modern web technologies** can build a secure, transparent, and decentralized healthcare system.

---

## 🧠 How It Works (Simple Flow)

1. 👤 User connects wallet (MetaMask)
2. 📝 Registers as **Doctor** or **Patient**
3. 🛡️ Admin approves role via smart contract
4. 🔑 Access permissions are enforced using **on-chain ABAC**
5. 📂 Medical data access is controlled, secure, and auditable

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

### 🔗 Blockchain

* Solidity
* Hardhat
* Ethereum (Localhost / Sepolia)
* MetaMask

### ⚙️ Backend

* FastAPI (Python)
* SQLite / PostgreSQL
* Uvicorn

### 🎨 Frontend

* React (Vite)
* Tailwind CSS
* Viem (Web3 interaction)

### 🧰 Tools

* Node.js & npm
* Python (venv)
* Git & GitHub

---

## ✨ Key Features

* 🔐 Attribute-Based Access Control (ABAC) on blockchain
* 👥 Role-based system (Admin / Doctor / Patient)
* 🦊 Wallet-based authentication (MetaMask)
* 📜 Smart contract role management (`grantRole`)
* 📊 Transparent and auditable access logs
* ⚡ Full-stack decentralized architecture

---

## 🚀 Quick Start

### 1️⃣ Blockchain Setup

```bash
cd blockchain
npm install
npm run node
```

New terminal:

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

### 4️⃣ MetaMask Setup

* Network: `http://127.0.0.1:8545`
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
| GET    | /register      | Get all requests    |
| DELETE | /register/{id} | Delete request      |

---

## 🧪 Development Notes

* Uses **localStorage** for demo data persistence
* Can be extended with backend DB integration
* Supports both **Localhost** and **Sepolia testnet**

---

## 🚧 Future Improvements

* 🔐 End-to-end encryption for medical records
* ☁️ IPFS integration for decentralized storage
* 📱 Mobile app support
* 🔔 Notification system for approvals
* 🧾 Full audit trail dashboard

---

## 🎓 Academic Context

This project is developed as part of an undergraduate thesis:

> **"A Blockchain-Based Attribute-Based Access Control System for Secure Patient Data Sharing in Telemedicine"**

---

## 🤝 Contribution

Feel free to fork, contribute, or raise issues. Suggestions are welcome!

---

## 📜 License

This project is for educational and research purposes.

---

## ⭐ Support

If you found this helpful, consider giving a ⭐ on GitHub!
