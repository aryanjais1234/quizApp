# ❓ Question Service — Question Bank Management

Spring Boot microservice managing the question bank. Provides CRUD operations for quiz questions, category-based filtering, random question selection for quiz creation, and score calculation for student submissions. Registered with Eureka.

## 📊 Service Type: Business Logic — Question Management

## 🏗️ Architecture

```
┌──────────────┐         ┌────────────────────┐         ┌──────────────────┐
│  API Gateway │────────▶│  Question Service  │────────▶│    PostgreSQL    │
│  (port 8765) │         │    (port 8086)      │         │   (questiondb)   │
└──────────────┘         └────────────────────┘         └──────────────────┘
                                  ▲       ▲
                                  │       │
                    ┌─────────────┘       └──────────────┐
                    │ Feign Client                       │ HTTP
          ┌────────┴────────┐               ┌───────────┴──────────┐
          │  Quiz Service   │               │  AI Agent Service    │
          │  (port 8090)    │               │  (port 5000)         │
          └─────────────────┘               └──────────────────────┘
          Fetches questions &                Saves AI-generated
          requests scoring                   questions
```

## ✨ Features

- **Full CRUD for questions** — create, read, and update quiz questions
- **Category-based question filtering** — retrieve questions by category
- **Random question selection** — generate random question sets for quizzes
- **Batch question upload** — add multiple questions at once via `addMultiple`
- **Score calculation** — evaluate student responses and return scores
- **AI service integration** — persist AI-generated questions from the AI Agent Service
- **Eureka service registration** — discoverable by other microservices

## 📦 Entity

```
QUESTION (table: question)
├── id: Integer (PK, auto-generated)
├── questionTitle: String
├── option1: String
├── option2: String
├── option3: String
├── option4: String
├── rightAnswer: String
├── difficultylevel: String
└── category: String
```

## 📋 DTOs

| DTO | Fields | Purpose |
|-----|--------|---------|
| `QuizQuestionResponse` | `id`, `questionTitle`, `option1`, `option2`, `option3`, `option4` | Hides `rightAnswer` when serving questions to students |
| `QuizResponseSubmit` | `id`, `response` | Captures a student's answer for a single question |
| `QuizStudentQuestion` | `id`, `questionTitle`, `option1`–`option4`, `difficulty`, `category` | Full question view including difficulty and category |

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/question/allQuestions` | Get all questions |
| `GET` | `/question/category/{category}` | Get questions by category |
| `POST` | `/question/add` | Add a single question |
| `POST` | `/question/addMultiple` | Batch add questions |
| `PUT` | `/question/update/{id}` | Update a question |
| `GET` | `/question/generate?categoryName=x&numQuestions=n` | Get random question IDs for quiz generation |
| `POST` | `/question/getQuestions` | Get question details by IDs (hides answers) |
| `POST` | `/question/getQuestionDetails` | Get full question details by IDs |
| `POST` | `/question/getScore` | Calculate score from student responses |

## ⚙️ Configuration

| Property | Value |
|----------|-------|
| Port | `8086` |
| Database | `questionDB` (PostgreSQL) |
| Eureka Client | Enabled |

## 🔄 Flow Diagrams

### Question Creation Flow

```
Client/AI Agent                Question Service                  PostgreSQL
      │                              │                              │
      │  POST /question/add          │                              │
      │  {questionTitle, options,     │                              │
      │   rightAnswer, category, ...} │                              │
      │─────────────────────────────▶│                              │
      │                              │  INSERT INTO question         │
      │                              │─────────────────────────────▶│
      │                              │            saved              │
      │                              │◀─────────────────────────────│
      │   201 Created                │                              │
      │◀─────────────────────────────│                              │
```

### Scoring Flow

```
Quiz Service                  Question Service                  PostgreSQL
      │                              │                              │
      │  POST /question/getScore     │                              │
      │  [{id: 1, response: "A"},    │                              │
      │   {id: 2, response: "C"}]    │                              │
      │─────────────────────────────▶│                              │
      │                              │  SELECT rightAnswer           │
      │                              │  WHERE id IN (1, 2)           │
      │                              │─────────────────────────────▶│
      │                              │         answers               │
      │                              │◀─────────────────────────────│
      │                              │                              │
      │                              │  Compare responses            │
      │                              │  to rightAnswer               │
      │                              │                              │
      │   score: 2                   │                              │
      │◀─────────────────────────────│                              │
```

## 🔍 Custom Repository Query

The service uses a native SQL query for random question selection:

```java
@Query(value = "SELECT q.id FROM question q WHERE LOWER(q.category) = LOWER(:category) ORDER BY RANDOM() LIMIT :numQ", nativeQuery = true)
List<Integer> findRandomQuestionsByCategory(String category, Integer numQ);
```

This performs case-insensitive category matching and leverages PostgreSQL's `RANDOM()` function to return a randomized subset of question IDs.

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Spring Boot 3.5.3 | Application framework |
| Spring Data JPA | Database access & ORM |
| PostgreSQL | Persistent storage |
| Eureka Client | Service discovery registration |
| OpenFeign | Declarative inter-service communication |
| Lombok | Boilerplate reduction |

## 🚀 How to Run

### Prerequisites

- **PostgreSQL** running with a `questionDB` database created
- **Service Registry** (Eureka Server) running

### Start the Service

```bash
cd backend/microservices/questionService && mvn spring-boot:run
```

The service starts on **port 8086** and registers with Eureka automatically.

## 📁 Project Structure

```
questionService/
├── src/main/java/com/questionService/
│   ├── QuestionServiceApplication.java
│   ├── controller/
│   │   └── QuestionController.java
│   ├── service/
│   │   ├── QuestionService.java
│   │   └── CorsConfig.java
│   ├── dao/
│   │   └── QuestionDao.java
│   ├── model/
│   │   └── Question.java
│   └── dto/
│       ├── QuizQuestionResponse.java
│       ├── QuizResponseSubmit.java
│       └── QuizStudentQuestion.java
├── src/main/resources/
│   └── application.yml
├── Dockerfile
└── pom.xml
```
