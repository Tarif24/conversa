<br />
<div align="center">
  <a href="https://conversa.tarifmohammad.com/">
    <img src="frontend/src/assets/conversa_icon.svg" alt="Logo" width="240" height="240">
  </a>
</div>

# Conversa – Real-Time Messaging Application

Conversa is a real-time messaging application built with a focus on clean backend architecture, middleware design, and scalable WebSocket communication.

---

## 🚀 Overview

Conversa supports:

- User authentication (JWT-based)
- Real-time messaging via Socket.io
- Chat room architecture
- Persistent message storage
- Rate limiting and request logging

The project emphasizes separation of concerns and middleware-driven architecture.

---

## 🏗 System Architecture

### Frontend
- React client
- Socket.io client for real-time events

### Backend
- Node.js + Express
- Middleware for:
  - Authentication
  - Logging
  - Rate limiting
- Socket.io integrated with an HTTP server

### Database
- MongoDB for users, conversations, and messages

---

## 🏗 Architecture Diagram

Client (React)</br>
  └── WebSocket Connection (Socket.io)</br>
          ↓</br>
Express Server (Node.js)</br>
  ├── Middleware Layer</br>
  │     ├── JWT Authentication</br>
  │     ├── Rate Limiting</br>
  │     └── Logging</br>
  └── Socket.io Server</br>
          ↓</br>
MongoDB</br>

---

## 🔄 Message Flow

1. User emits a message via WebSocket
2. JWT validated in the socket middleware
3. Message validated and persisted in MongoDB
4. Server broadcasts to the relevant room
5. Clients update UI in real time

---

## 🔐 Authentication & Middleware

- Password hashing with bcrypt
- JWT issuance and validation
- JWT refresh tokens
- Route-level protection
- Socket-level authentication
- Rate-limiting middleware to prevent abuse

---

## ⚖️ Current Scalability Constraints

- Single Node.js deployment instance
- In-memory Socket.io session storage
- No Redis adapter for multi-instance scaling
- Rate limiting scoped per instance

These decisions prioritize simplicity but limit horizontal scalability.

Future scaling improvements:
- Redis adapter for Socket.io
- Load balancing across instances
- Distributed rate limiting
- MongoDB replication

---

## 🛠 Tech Stack

- React
- Node.js
- Socket.io
- MongoDB
- Railway (deployment)

---

## 🌐 Live Demo

https://conversa.tarifmohammad.com/

---

## 📬 Contact

Tarif Mohammad - [@GitHub](https://github.com/Tarif24) - [@Linkedin](https://www.linkedin.com/in/tarif-mohammad/) - Tarif24@hotmail.com
</br>
</br>
