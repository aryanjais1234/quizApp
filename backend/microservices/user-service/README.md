# 👤 User Service — Authentication & Authorization

Spring Boot microservice handling user registration, login, JWT token generation, and role management. Supports two roles: **TEACHER** and **STUDENT**. Registered with Eureka for service discovery.

> **Service Type:** 🔐 Authentication Service

---

## 🏗️ Architecture

```
┌────────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────────────┐
│  Frontend   │────▶│   Gateway   │────▶│ User Service │────▶│ PostgreSQL (userDB) │
└────────────┘     └─────────────┘     └──────────────┘     └─────────────────────┘
```

---

## ✨ Features

- User registration with role assignment (`TEACHER` / `STUDENT`)
- JWT token generation (HS256)
- Token validation endpoint
- Role extraction from token
- Password hashing with BCrypt (Spring Security `PasswordEncoder`)
- Eureka service registration
- User lookup by username

---

## 📦 Entity Model

```
APP_USER (table: app_user)
├── id: Integer (PK, auto-generated)
├── username: String (unique)
├── password: String (BCrypt hashed)
└── role: Enum (STUDENT | TEACHER)
```

### Supporting Types

| Type | Fields | Description |
|------|--------|-------------|
| `Role` | `STUDENT`, `TEACHER` | Enum defining user roles |
| `AuthRequest` | `username`, `password` | Login/register request body |
| `AuthResponse` | `token` | JWT token response |

---

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | No | Register new user (body: `{username, password, role}`) |
| `POST` | `/auth/login` | No | Login, returns JWT token |
| `GET` | `/auth/validate?token=xxx` | No | Validate JWT token |
| `GET` | `/auth/role?token=xxx` | No | Extract role from token |
| `GET` | `/auth/username/{userName}` | No | Get user ID by username |

---

## ⚙️ Configuration

| Property | Value |
|----------|-------|
| Port | `8091` |
| Database | `userDB` (PostgreSQL) |
| Datasource URL | `jdbc:postgresql://127.0.0.1:5432/userDB` |
| JPA DDL Auto | `update` |
| Eureka Client | Enabled |

---

## 🔄 Flow Diagrams

### Registration Flow

```
Client                    AuthController              UserRepository           Database
  │                            │                           │                      │
  │  POST /auth/register       │                           │                      │
  │  {username, pwd, role}     │                           │                      │
  │───────────────────────────▶│                           │                      │
  │                            │  encode password (BCrypt) │                      │
  │                            │──────────┐                │                      │
  │                            │◀─────────┘                │                      │
  │                            │  save(user)               │                      │
  │                            │──────────────────────────▶│  INSERT INTO app_user│
  │                            │                           │─────────────────────▶│
  │                            │                           │◀─────────────────────│
  │                            │◀──────────────────────────│                      │
  │  "User registered"        │                           │                      │
  │◀───────────────────────────│                           │                      │
```

### Login Flow

```
Client                    AuthController        AuthenticationManager     JwtUtil
  │                            │                        │                    │
  │  POST /auth/login          │                        │                    │
  │  {username, password}      │                        │                    │
  │───────────────────────────▶│                        │                    │
  │                            │  authenticate(creds)   │                    │
  │                            │───────────────────────▶│                    │
  │                            │  ✅ valid              │                    │
  │                            │◀───────────────────────│                    │
  │                            │  generateToken(user)   │                    │
  │                            │────────────────────────────────────────────▶│
  │                            │  JWT (HS256)           │                    │
  │                            │◀────────────────────────────────────────────│
  │  { "token": "eyJhb..." }  │                        │                    │
  │◀───────────────────────────│                        │                    │
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Spring Boot 3.5.3 | Application framework |
| Spring Security | Authentication & password encoding |
| Spring Data JPA | Database access |
| JJWT | JWT token generation & validation |
| PostgreSQL | Persistent storage |
| Eureka Client | Service discovery registration |
| OpenFeign | Inter-service communication |
| Lombok | Boilerplate reduction |

---

## 🚀 How to Run

### Prerequisites

- PostgreSQL running with a `userDB` database created
- Service Registry (Eureka Server) running

### Run Locally

```bash
cd backend/microservices/user-service && mvn spring-boot:run
```

The service will start on port **8091**.

---

## 📁 Project Structure

```
user-service/
├── src/main/java/com/userService/user_service/
│   ├── UserServiceApplication.java
│   ├── config/
│   │   ├── JwtAuthFilter.java
│   │   ├── JwtUtil.java
│   │   ├── SecurityConfig.java
│   │   └── UserDetailsServiceImpl.java
│   ├── controller/
│   │   └── AuthController.java
│   ├── dao/
│   │   └── UserRepository.java
│   └── model/
│       ├── User.java
│       ├── Role.java
│       ├── AuthRequest.java
│       └── AuthResponse.java
├── src/main/resources/
│   └── application.yml
├── Dockerfile
└── pom.xml
```
