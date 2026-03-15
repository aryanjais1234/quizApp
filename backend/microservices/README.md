<div align="center">

# ⚙️ QuizApp Backend — Spring Boot Microservices

**A scalable, microservices-based backend powering the QuizApp platform with service discovery, API gateway routing, JWT authentication, and inter-service communication.**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Cloud](https://img.shields.io/badge/Spring%20Cloud-2025.0.0-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-cloud)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Maven](https://img.shields.io/badge/Maven-3.9-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)](https://maven.apache.org/)

[Architecture](#-architecture-diagram) · [Services](#-service-overview) · [Data Models](#-entity--data-models) · [API Endpoints](#-api-endpoints-summary) · [How to Run](#-how-to-run) · [Tech Stack](#-tech-stack)

</div>

---

## 🏗 Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (React Frontend)                         │
│                            http://localhost:5173                          │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │  HTTP / REST
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     🔀 API GATEWAY (Port 8765)                           │
│              Spring Cloud Gateway · JWT AuthFilter · CORS                │
│                                                                          │
│   /auth/**  ──→  USER-SERVICE         (no auth filter)                   │
│   /question/** ──→  QUESTION-SERVICE  (auth required)                    │
│   /quiz/**  ──→  QUIZ-SERVICE         (auth required)                    │
│   /materials/** ──→  MATERIAL-SERVICE (auth required)                    │
└──────┬──────────────┬──────────────┬──────────────┬──────────────────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────┐
│ 👤 User    │ │ ❓ Question│ │ 📝 Quiz    │ │ 📂 Material    │
│  Service   │ │  Service   │ │  Service   │ │  Service       │
│  :8091     │ │  :8086     │ │  :8081     │ │  :8082         │
└─────┬──────┘ └─────┬──────┘ └──┬───┬─────┘ └───────┬────────┘
      │              │           │   │                │
      │              │     Feign │   │ Feign          │
      │◄─────────────┼──────────┘   └────►│          │
      │              │◄──────────────────┘           │
      ▼              ▼              ▼                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       🐘 PostgreSQL 15 (Port 5432)                       │
│                                                                          │
│   ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────────┐       │
│   │  userDB  │  │  questionDB  │  │  quizDB  │  │  materialdb  │       │
│   └──────────┘  └──────────────┘  └──────────┘  └──────────────┘       │
└──────────────────────────────────────────────────────────────────────────┘
                               │
              ┌────────────────┘
              ▼
┌──────────────────────────┐
│  📡 Service Registry     │
│  Eureka Server :8761     │
│  (Discovery & Registry)  │
└──────────────────────────┘
```

---

## 📦 Service Overview

| Icon | Service | Port | Database | Type | Description |
|:----:|:--------|:----:|:--------:|:----:|:------------|
| 📡 | **service-registry** | `8761` | — | Infrastructure | Eureka discovery server — all services register here |
| 🔀 | **api-gateway** | `8765` | — | Infrastructure | Spring Cloud Gateway — JWT validation, RBAC, CORS, routing |
| 👤 | **user-service** | `8091` | `userDB` | Auth | User registration, login, JWT token issuance & validation |
| ❓ | **questionService** | `8086` | `questionDB` | Business | Question bank CRUD, random question generation by category |
| 📝 | **quizService** | `8081` | `quizDB` | Business | Quiz creation, submission, scoring, analytics, student history |
| 📂 | **material-service** | `8082` | `materialdb` | Business | Lecture material upload, Supabase file storage, transcripts |

---

## 🗄️ Entity / Data Models

### 👤 APP_USER (`user-service` → table: `app_user`)

| Field | Type | Constraints | Description |
|:------|:-----|:------------|:------------|
| `id` | Integer | PK, Auto-generated | Unique user identifier |
| `username` | String | Unique | Login username |
| `password` | String | Encoded | BCrypt-hashed password |
| `role` | Enum (STRING) | `STUDENT` / `TEACHER` | Role-based access control |

### ❓ QUESTION (`questionService` → table: `question`)

| Field | Type | Constraints | Description |
|:------|:-----|:------------|:------------|
| `id` | Integer | PK, Auto-generated | Question identifier |
| `questionTitle` | String | — | The question text |
| `option1` | String | — | Answer choice A |
| `option2` | String | — | Answer choice B |
| `option3` | String | — | Answer choice C |
| `option4` | String | — | Answer choice D |
| `rightAnswer` | String | — | Correct answer text |
| `difficultylevel` | String | — | Difficulty level (e.g., Easy, Medium, Hard) |
| `category` | String | — | Subject/course category |

### 📝 QUIZ (`quizService` → table: `quiz`)

| Field | Type | Constraints | Description |
|:------|:-----|:------------|:------------|
| `id` | Integer | PK, Auto-generated | Quiz identifier |
| `title` | String | — | Quiz title |
| `categoryName` | String | — | Subject category |
| `createdBy` | String | — | Teacher's username |
| `userId` | Integer | — | Teacher's user ID |
| `createdDate` | LocalDateTime | Auto-set via `@PrePersist` | Quiz creation timestamp |
| `questionIds` | List\<Integer\> | `@ElementCollection` | IDs of questions in the quiz |

### 📊 QUIZ_SUBMISSION (`quizService` → table: `quiz_submission`)

| Field | Type | Constraints | Description |
|:------|:-----|:------------|:------------|
| `submissionId` | Integer | PK, Auto-generated | Submission identifier |
| `quizId` | Integer | — | Reference to Quiz |
| `username` | String | — | Student who took the quiz |
| `score` | Integer | — | Student's score |
| `totalQuestions` | Integer | — | Total questions in the quiz |
| `dateTaken` | LocalDateTime | Auto-set via `@PrePersist` | Submission timestamp |
| `timeSpent` | String | — | Duration of the attempt |
| `responsesJson` | JsonNode | `columnDefinition = "jsonb"` | Student responses stored as JSONB |

### 📂 LECTURE_MATERIAL (`material-service` → table: `lecture_materials`)

| Field | Type | Constraints | Description |
|:------|:-----|:------------|:------------|
| `id` | Integer | PK, Auto-generated | Material identifier |
| `title` | String | NOT NULL | Material title |
| `description` | String | Max 1000 chars | Material description |
| `teacherUsername` | String | NOT NULL | Uploader's username |
| `category` | String | NOT NULL | Subject category |
| `fileUrl` | String | NOT NULL | Supabase storage URL |
| `fileName` | String | NOT NULL | Original file name |
| `fileType` | String | NOT NULL | MIME type |
| `fileSize` | Long | — | File size in bytes |
| `transcript` | String | `TEXT` column | Optional lecture transcript |
| `uploadedAt` | LocalDateTime | NOT NULL | Upload timestamp |

---

## 🔄 API Endpoints Summary

All requests go through the **API Gateway** at `http://localhost:8765`.

### 👤 Auth — `/auth/**` (No Auth Filter)

| Method | Endpoint | Description | Request Body |
|:------:|:---------|:------------|:-------------|
| `POST` | `/auth/register` | Register a new user | `{ username, password, role }` |
| `POST` | `/auth/login` | Login & get JWT token | `{ username, password }` |
| `GET` | `/auth/validate?token=<JWT>` | Validate a JWT token | — |
| `GET` | `/auth/role?token=<JWT>` | Get user role from token | — |
| `GET` | `/auth/username/{userName}` | Get user ID by username | — |

### ❓ Questions — `/question/**` (Auth Required)

| Method | Endpoint | Description | Request Body |
|:------:|:---------|:------------|:-------------|
| `GET` | `/question/allQuestions` | Get all questions | — |
| `GET` | `/question/category/{category}` | Get questions by category | — |
| `POST` | `/question/add` | Add a single question | `Question` object |
| `POST` | `/question/addMultiple` | Add multiple questions | `List<Question>` |
| `PUT` | `/question/update/{id}` | Update a question | `Question` object |
| `GET` | `/question/generate?categoryName=&numQuestions=` | Generate random question IDs | — |
| `POST` | `/question/getQuestions` | Get question details by IDs | `List<Integer>` |
| `POST` | `/question/getQuestionDetails` | Get student-view question details | `List<Integer>` |
| `POST` | `/question/getScore` | Calculate score from responses | `List<QuizResponseSubmit>` |

### 📝 Quiz — `/quiz/**` (Auth Required)

| Method | Endpoint | Description | Headers |
|:------:|:---------|:------------|:--------|
| `POST` | `/quiz/create` | Create a new quiz | `username` |
| `GET` | `/quiz/get/{id}` | Get quiz questions by quiz ID | — |
| `POST` | `/quiz/submit/{id}` | Submit quiz answers | `username` |
| `GET` | `/quiz/teacher/quizzes` | Get teacher's created quizzes | `username` |
| `GET` | `/quiz/student/history` | Get student's quiz history | `username` |
| `GET` | `/quiz/student/result/{responseId}` | Get detailed result of a submission | — |
| `GET` | `/quiz/analytics/{quizId}` | Get quiz analytics (all submissions) | — |

### 📂 Materials — `/materials/**` (Auth Required)

| Method | Endpoint | Description | Headers |
|:------:|:---------|:------------|:--------|
| `POST` | `/materials/upload` | Upload lecture material (multipart) | `username` |
| `GET` | `/materials/teacher/{teacherUsername}` | Get materials by teacher | — |
| `GET` | `/materials/my` | Get current teacher's materials | `username` |
| `GET` | `/materials/{id}` | Get material by ID | — |
| `GET` | `/materials/category/{category}` | Get materials by category | — |
| `DELETE` | `/materials/{id}` | Delete material (owner only) | `username` |
| `PUT` | `/materials/{id}/transcript` | Add/update transcript | `username` |

---

## 🔗 Inter-Service Communication

The **quiz-service** communicates with other services via **OpenFeign** declarative REST clients, resolved through **Eureka** service discovery with client-side load balancing (`lb://`).

```
┌─────────────────────┐         Feign (lb://USER-SERVICE)         ┌─────────────────────┐
│                     │  ──── /auth/username/{userName} ────────► │                     │
│    📝 Quiz Service  │                                           │   👤 User Service   │
│       :8081         │         Feign (lb://QUESTION-SERVICE)     │       :8091         │
│                     │  ──── /question/generate ───────────────► └─────────────────────┘
│                     │  ──── /question/getQuestions ───────────►
│                     │  ──── /question/getQuestionDetails ────► ┌─────────────────────┐
│                     │  ──── /question/getScore ──────────────► │  ❓ Question Service │
└─────────────────────┘                                           │       :8086         │
                                                                  └─────────────────────┘
```

| Feign Client | Target Service | Endpoints Called | Purpose |
|:-------------|:---------------|:-----------------|:--------|
| `UserInterface` | `user-service` | `GET /auth/username/{userName}` | Resolve username → user ID for quiz creation |
| `QuizInterface` | `question-service` | `GET /question/generate` | Get random question IDs by category |
| | | `POST /question/getQuestions` | Fetch full question details for teacher view |
| | | `POST /question/getQuestionDetails` | Fetch questions for student quiz view |
| | | `POST /question/getScore` | Calculate student score from responses |

---

## ✨ Features

- 🔐 **JWT Authentication** — HMAC-SHA256 token-based auth with role extraction
- 🛡️ **API Gateway** — Centralized routing, CORS, and auth filter enforcement
- 📡 **Service Discovery** — Eureka-based registration & client-side load balancing
- 🔗 **OpenFeign Clients** — Declarative inter-service REST communication
- 🗄️ **Database-per-Service** — Each microservice owns its own PostgreSQL database
- 📊 **JSONB Analytics** — Student quiz responses stored as JSONB for flexible querying
- 📂 **Supabase Integration** — Cloud file storage for lecture materials
- 🐳 **Docker Compose** — One-command orchestration of all services + PostgreSQL
- 👨‍🏫 **Role-Based Access** — Teacher and Student roles with fine-grained permissions
- 📈 **Quiz Analytics** — Per-quiz submission tracking, scoring, and history

---

## 🚀 How to Run

### 🐳 Docker Compose (Recommended)

The easiest way to start all services, including PostgreSQL:

```bash
cd backend/microservices

# Build and start all services
docker compose up --build

# Or run in detached mode
docker compose up --build -d
```

This will:
1. Start **PostgreSQL 15** on port `5432` and create all 4 databases via `init-db/init.sql`
2. Start **Eureka Service Registry** on port `8761`
3. Start all **business services** (user, question, quiz, material)
4. Start the **API Gateway** on port `8765`

> **Verify:** Open [http://localhost:8761](http://localhost:8761) to see all registered services in the Eureka dashboard.

```bash
# Stop all services
docker compose down

# Stop and remove volumes (clears database data)
docker compose down -v
```

### 💻 Local Development

<details>
<summary>Run services individually without Docker</summary>

**Prerequisites:**
- Java 17+
- Maven 3.9+
- PostgreSQL 15 running locally on port `5432`

**1. Create the databases:**

```sql
CREATE DATABASE questionDB;
CREATE DATABASE quizDB;
CREATE DATABASE userDB;
CREATE DATABASE materialdb;
```

**2. Start services in order:**

```bash
# 1. Service Registry (must start first)
cd service-registry
mvn spring-boot:run

# 2. Business services (in separate terminals)
cd user-service && mvn spring-boot:run
cd questionService && mvn spring-boot:run
cd quizService && mvn spring-boot:run
cd material-service && mvn spring-boot:run

# 3. API Gateway (start last)
cd api-gateway
mvn spring-boot:run
```

> **Note:** Update `application.yml` in each service to point to `localhost:5432` instead of `postgres-db:5432` for local development.

</details>

---

## ⚙️ Configuration

### Docker Compose Services

The `docker-compose.yml` orchestrates 7 containers on a shared `microservices-net` network:

| Container | Image/Build | Port | Depends On |
|:----------|:------------|:----:|:-----------|
| `postgres-db` | `postgres:15` | `5432` | — |
| `service-registry` | `./service-registry` | `8761` | — |
| `questionService` | `./questionService` | `8086` | db, service-registry |
| `quizService` | `./quizService` | `8081` | db, service-registry |
| `user-service` | `./user-service` | `8091` | db, service-registry |
| `material-service` | `./material-service` | `8082` | db, service-registry |
| `api-gateway` | `./api-gateway` | `8765` | service-registry |

### Database Initialization

The `init-db/init.sql` script runs automatically on first PostgreSQL startup:

```sql
CREATE DATABASE questionDB;
CREATE DATABASE quizDB;
CREATE DATABASE userDB;
CREATE DATABASE materialdb;
```

### Environment Variables

<details>
<summary>Click to expand environment variables</summary>

| Variable | Service | Description |
|:---------|:--------|:------------|
| `POSTGRES_USER` | postgres-db | Database username (`postgres`) |
| `POSTGRES_PASSWORD` | postgres-db | Database password |
| `SPRING_DATASOURCE_URL` | All business services | JDBC connection string |
| `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` | All services | Eureka registry URL |
| `SUPABASE_URL` | material-service | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | material-service | Supabase service role key |
| `SUPABASE_BUCKET` | material-service | Supabase storage bucket name |

</details>

---

## 🛠 Tech Stack

| Category | Technology | Description |
|:---------|:-----------|:------------|
| ☕ **Runtime** | Java 17+ | Language runtime |
| 🌱 **Framework** | Spring Boot 3.5.3 | Application framework |
| ☁️ **Cloud** | Spring Cloud 2025.0.0 | Microservices toolkit |
| 📡 **Discovery** | Eureka Server | Service registry & discovery |
| 🔀 **Gateway** | Spring Cloud Gateway | API routing & filtering |
| 🔗 **IPC** | OpenFeign | Declarative REST client |
| 🗄️ **Database** | PostgreSQL 15 | Relational database |
| 🔐 **Auth** | JWT (HMAC-SHA256) | Token-based authentication |
| 📂 **Storage** | Supabase Storage | Cloud file storage |
| 🐳 **Containers** | Docker Compose | Multi-container orchestration |
| 🔨 **Build** | Maven 3.9 | Dependency management & build |

---

<div align="center">

**[⬆ Back to Top](#️-quizapp-backend--spring-boot-microservices)**

</div>
