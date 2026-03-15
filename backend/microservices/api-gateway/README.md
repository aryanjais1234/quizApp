# 🔀 API Gateway — Spring Cloud Gateway

Reactive Spring Cloud Gateway that serves as the single entry point for all client requests. Handles JWT validation, role-based access control (RBAC), dynamic routing via Eureka, CORS configuration, and username header injection to downstream services.

> **Service Type:** 🚪 Infrastructure — API Gateway

---

## 🏗️ Architecture

```
                         ┌─────────────────────┐
                         │   Frontend (:5173)   │
                         └─────────┬───────────┘
                                   │
                                   ▼
                      ┌────────────────────────┐
                      │   API Gateway (:8765)   │
                      │                        │
                      │  ┌──────────────────┐  │
                      │  │   AuthFilter      │  │
                      │  │  ─ JWT Validate   │  │
                      │  │  ─ Extract Role   │  │
                      │  │  ─ RBAC Check     │  │
                      │  │  ─ Inject Header  │  │
                      │  └──────────────────┘  │
                      └───┬────┬────┬────┬─────┘
                          │    │    │    │
              ┌───────────┘    │    │    └───────────┐
              ▼                ▼    ▼                ▼
      ┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
      │ QUIZ-SERVICE │ │ QUESTION │ │   USER   │ │  MATERIAL    │
      │   (:8081)    │ │ SERVICE  │ │ SERVICE  │ │  SERVICE     │
      │              │ │ (:8086)  │ │ (:8091)  │ │  (:8082)     │
      └──────────────┘ └──────────┘ └──────────┘ └──────────────┘
```

---

## ✨ Features

- **JWT Validation (HMAC-SHA256)** — Verifies token authenticity on every secured request
- **Role-Based Access Control (TEACHER/STUDENT)** — Enforces endpoint-level permissions based on JWT role claims
- **Dynamic Routing via Eureka** — Discovers and routes to downstream services registered with Service Registry
- **CORS Configuration** — Allows cross-origin requests from `http://localhost:5173`
- **Username Header Injection** — Extracts the username from the JWT and forwards it as a header to downstream services
- **Public Paths** — `/auth/register`, `/auth/login`, `/auth/validate`, `/eureka` bypass authentication

---

## 📦 Entity

None — this is an infrastructure service with no domain entities or database.

---

## 🗺️ Routing Table

| Path | Target Service | Auth Required | Role |
|---|---|---|---|
| `/quiz/**` | QUIZ-SERVICE (`:8081`) | ✅ Yes | `TEACHER` for create, `STUDENT` for submit |
| `/question/**` | QUESTION-SERVICE (`:8086`) | ✅ Yes | `TEACHER` |
| `/auth/**` | USER-SERVICE (`:8091`) | ❌ No | Public |
| `/materials/**` | MATERIAL-SERVICE (`:8082`) | ✅ Yes | `TEACHER` for upload/delete |

---

## 📂 Key Files

| File | Description |
|---|---|
| `AuthFilter.java` | Gateway filter that validates JWT, extracts role/username, and enforces RBAC |
| `RouteValidator.java` | Defines which paths are open (don't need authentication) |
| `JwtUtil.java` | JWT validation, role extraction, and username extraction |
| `CorsConfig.java` | CORS configuration for allowed origins and methods |
| `AppConfig.java` | Application configuration |

---

## ⚙️ Configuration (`application.yml`)

- **Port:** `8765`
- **Routes:** Defined for quiz, question, user, and material services
- **CORS:** Allows `http://localhost:5173`
- **Eureka Client:** Enabled — registers with and discovers services from the Service Registry

---

## 🔄 Request Flow

```
Request → Gateway → JWT Validate → Extract Role → RBAC Check → Route to Service
                                                                    ↓
                                                          Inject username header
```

1. Client sends a request to the gateway (`http://localhost:8765`)
2. `RouteValidator` checks if the path is public — if so, skip auth
3. `AuthFilter` extracts and validates the JWT token (HMAC-SHA256)
4. Role is extracted from the token and checked against the endpoint's required role
5. Username is extracted and injected as a header to the downstream service
6. Request is routed to the appropriate microservice via Eureka discovery

---

## 🛠️ Tech Stack

| Technology | Version |
|---|---|
| Spring Boot | 3.5.3 |
| Spring Cloud Gateway | — |
| WebFlux (Reactive) | — |
| Eureka Client | — |
| JJWT | 0.11.5 |

---

## 🚀 How to Run

### Prerequisites

- **Service Registry** must be running (Eureka Server)
- At least one downstream service registered with Eureka

### Local

```bash
cd backend/microservices/api-gateway && mvn spring-boot:run
```

### Access

```
http://localhost:8765
```

---

## 📁 Project Structure

```
api-gateway/
├── src/main/java/com/Service/api_gateway/
│   ├── ApiGatewayApplication.java
│   ├── config/
│   │   ├── AppConfig.java
│   │   └── CorsConfig.java
│   ├── security/
│   │   ├── AuthFilter.java
│   │   └── RouteValidator.java
│   └── util/
│       └── JwtUtil.java
├── src/main/resources/
│   └── application.yml
├── Dockerfile
└── pom.xml
```
