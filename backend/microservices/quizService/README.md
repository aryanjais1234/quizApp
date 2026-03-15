# 📝 Quiz Service — Quiz Lifecycle & Analytics

Spring Boot microservice managing the full quiz lifecycle — from quiz creation by teachers to student submissions and analytics. Uses OpenFeign to communicate with **Question Service** (for questions and scoring) and **User Service** (for user lookup). Registered with **Eureka** for service discovery.

## 📊 Service Type

**Business Logic — Quiz Management & Analytics**

---

## 🏗️ Architecture Diagram

```
┌────────────┐         ┌──────────────┐         ┌──────────────────┐
│ API Gateway │────────▶│ Quiz Service │────────▶│ PostgreSQL       │
└────────────┘         │   (8081)     │         │ (quizdb)         │
                       └──────┬───┬───┘         └──────────────────┘
                              │   │
              ┌───────────────┘   └───────────────┐
              ▼ (Feign)                           ▼ (Feign)
┌─────────────────────┐               ┌─────────────────────┐
│  Question Service   │               │    User Service     │
│  - Get questions    │               │  - Get user ID by   │
│  - Get score        │               │    username         │
│  - Random IDs       │               └─────────────────────┘
└─────────────────────┘

┌──────────────────┐         ┌──────────────┐
│ AI Agent Service │────────▶│ Quiz Service │  (HTTP — save AI-generated quizzes)
└──────────────────┘         └──────────────┘
```

---

## ✨ Features

- **Quiz creation** — Teachers create quizzes by category or with hand-picked questions
- **Random question assignment** — Auto-select questions by category
- **Custom quiz** — Create a quiz with specific selected questions
- **Student quiz submissions** — Students submit answers with timing data
- **Score calculation** — Delegates scoring to Question Service via Feign
- **Quiz history** — Students view past quiz attempts
- **Detailed result view** — Question-by-question breakdown of answers
- **Teacher analytics** — Attempt counts, score distributions per quiz
- **Quiz submissions management** — Track and query all submissions
- **Feign-based inter-service communication** — Declarative REST clients for Question & User services

---

## 🗄️ Entities

### `QUIZ` (table: `quiz`)

```
QUIZ
├── id: Integer (PK, auto-generated)
├── title: String
├── categoryName: String
├── createdBy: String (teacher username)
├── userId: Integer
├── createdDate: LocalDateTime
└── questionIds: List<Integer> (@ElementCollection)
```

### `QUIZ_SUBMISSION` (table: `quiz_submission`)

```
QUIZ_SUBMISSION
├── submissionId: Integer (PK, auto-generated)
├── quizId: Integer
├── username: String
├── score: Integer
├── totalQuestions: Integer
├── dateTaken: LocalDateTime
├── timeSpent: String
└── responsesJson: JsonNode (JSONB column — stores student answers)
```

---

## 📦 DTOs

| DTO | Purpose |
|-----|---------|
| `QuizDto` | Core quiz data transfer |
| `TeacherQuizDto` | Quiz info enriched with `attemptCount` |
| `StudentQuizHistoryDto` | Past quiz attempts for a student |
| `StudentQuizResultDto` | Detailed result with individual responses |
| `TeacherAnalyticsDto` | Analytics data (attempts, scores) for teachers |

---

## 🔌 API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/quiz/create` | TEACHER | Create quiz (`{categoryName, numQuestions, title, questionIds?}`) |
| `GET` | `/quiz/get/{id}` | Any Auth | Get quiz questions for taking |
| `POST` | `/quiz/submit/{id}` | STUDENT | Submit quiz answers |
| `GET` | `/quiz/teacher/quizzes` | TEACHER | Get teacher's quizzes with attempt counts |
| `GET` | `/quiz/student/history` | STUDENT | Get student's quiz history |
| `GET` | `/quiz/student/result/{submissionId}` | STUDENT | Get detailed result |
| `GET` | `/quiz/analytics/{quizId}` | TEACHER | Get quiz analytics |

---

## 🔗 Feign Clients

| Client | Target Service | Operations |
|--------|----------------|------------|
| `QuizInterface` | Question Service | Get questions, get score, get random question IDs |
| `UserInterface` | User Service | Get user ID by username |

---

## ⚙️ Configuration

| Property | Value |
|----------|-------|
| Port | `8081` |
| Database | `quizDB` (PostgreSQL) |
| Eureka | Client enabled |

---

## 🔀 Flow Diagrams

### Quiz Creation Flow

```
Teacher ──▶ POST /quiz/create
               │
               ├── questionIds provided?
               │     ├── YES ─▶ Use provided question IDs
               │     └── NO ──▶ QuizInterface (Feign) ──▶ Question Service
               │                  └── Get random IDs by category
               │
               ├── UserInterface (Feign) ──▶ User Service
               │     └── Resolve username → userId
               │
               └── Save Quiz ──▶ PostgreSQL (quizdb)
```

### Quiz Submission Flow

```
Student ──▶ POST /quiz/submit/{id}
               │
               ├── QuizInterface (Feign) ──▶ Question Service
               │     └── Calculate score from responses
               │
               ├── Build QuizSubmission
               │     ├── score, totalQuestions
               │     ├── timeSpent, dateTaken
               │     └── responsesJson (JSONB)
               │
               └── Save QuizSubmission ──▶ PostgreSQL (quizdb)
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Spring Boot 3.5.3 | Application framework |
| Spring Data JPA | Database access & ORM |
| OpenFeign | Declarative REST clients |
| PostgreSQL | Primary database |
| Eureka Client | Service discovery registration |
| Lombok | Boilerplate reduction |
| Jackson (JSONB) | JSON serialization for JSONB columns |

---

## 🚀 How to Run

### Prerequisites

- **PostgreSQL** with a `quizDB` database created
- **Service Registry** (Eureka) running
- **Question Service** running
- **User Service** running

### Run Locally

```bash
cd backend/microservices/quizService
mvn spring-boot:run
```

The service starts on **port 8081**.

---

## 📁 Project Structure

```
quizService/
├── src/main/java/com/quizService/quizService/
│   ├── QuizServiceApplication.java
│   ├── controller/
│   │   └── QuizController.java
│   ├── service/
│   │   ├── QuizService.java
│   │   └── CorsConfig.java
│   ├── dao/
│   │   ├── QuizDao.java
│   │   └── QuizSubmissionDao.java
│   ├── model/
│   │   ├── Quiz.java
│   │   └── QuizSubmission.java
│   ├── dto/
│   │   ├── QuizDto.java
│   │   ├── TeacherQuizDto.java
│   │   ├── StudentQuizHistoryDto.java
│   │   ├── StudentQuizResultDto.java
│   │   ├── TeacherAnalyticsDto.java
│   │   └── ... (other DTOs)
│   └── feign/
│       ├── QuizInterface.java
│       └── UserInterface.java
├── src/main/resources/
│   └── application.yml
├── Dockerfile
└── pom.xml
```
