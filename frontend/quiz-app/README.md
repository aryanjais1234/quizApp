# ⚛️ QuizApp Frontend — React + Vite SPA

A modern, role-based quiz management single-page application built with **React 19** and **Vite 7**. Teachers create and manage quizzes; students take quizzes and review results — all through a clean, responsive interface backed by a microservice architecture.

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture Diagram](#️-architecture-diagram)
- [🛠️ Tech Stack](#️-tech-stack)
- [🗺️ Pages & Routes](#️-pages--routes)
- [🗄️ State Management](#️-state-management)
- [🧩 Components](#-components)
- [📁 Project Structure](#-project-structure)
- [🔌 API Integration](#-api-integration)
- [🚀 How to Run](#-how-to-run)
- [⚙️ Environment / Configuration](#️-environment--configuration)

---

## ✨ Features

### 🎓 Role-Based UI

| Role | Capabilities |
|------|-------------|
| **👩‍🏫 Teacher** | Create quizzes, add questions, upload materials, generate AI quizzes, view analytics & submissions |
| **👨‍🎓 Student** | Browse available quizzes, take quizzes, submit answers, view results & responses |

### 👩‍🏫 Teacher Features

- 📝 Create quizzes manually or with the advanced quiz creator
- 🤖 AI-powered quiz generation from uploaded materials
- 📊 Per-quiz analytics and submission review
- 📂 Upload and manage course materials
- ❓ Add, view, and manage questions

### 👨‍🎓 Student Features

- 📋 Browse and take available quizzes
- ✅ Submit answers and get instant feedback
- 📈 View personal dashboard with quiz history
- 🔍 Review individual submission responses

### 🎨 General

- 📱 Responsive design with SCSS styling
- 🔐 JWT authentication with protected routes
- ⚡ Fast development with Vite HMR
- 🔄 Centralized state management with Redux Toolkit

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   React SPA (Vite)                      │
│                                                         │
│  ┌───────────┐  ┌───────────┐  ┌────────────────────┐  │
│  │  Pages /   │  │  Redux    │  │  AuthContext        │  │
│  │  Router    │◄─┤  Store    │  │  (JWT + User Info)  │  │
│  └─────┬─────┘  └─────┬─────┘  └────────────────────┘  │
│        │               │                                 │
│        └───────┬───────┘                                 │
│                ▼                                         │
│         ┌─────────────┐                                  │
│         │    Axios     │                                  │
│         │ (interceptor)│                                  │
│         └──────┬──────┘                                  │
└────────────────┼────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
 ┌──────────────┐  ┌──────────────┐
 │ API Gateway  │  │  AI Service  │
 │ :8765        │  │  :8083       │
 └──────┬───────┘  └──────────────┘
        │
        ▼
 ┌──────────────┐
 │ Microservices│
 │ (Quiz, User, │
 │  Question …) │
 └──────────────┘
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|:----------:|:-------:|---------|
| ⚛️ React | 19 | UI library |
| ⚡ Vite | 7 | Build tool & dev server |
| 🗄️ Redux Toolkit | 2.11 | Global state management |
| 🧭 React Router | 7.7 | Client-side routing |
| 🌐 Axios | 1.10 | HTTP client |
| 🎨 Sass (SCSS) | 1.98 | Stylesheet preprocessor |
| 🔐 JWT | — | Authentication (localStorage) |

---

## 🗺️ Pages & Routes

### 🌍 Public Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Home | Landing page |
| `/login` | Login | User authentication |
| `/register` | Register | New user registration |

### 👩‍🏫 Teacher Routes

| Path | Page | Description |
|------|------|-------------|
| `/teacher-dashboard` | Teacher Dashboard | Overview of teacher activities |
| `/create-quiz` | Create Quiz | Basic quiz creation form |
| `/advanced-quiz-creator` | Advanced Quiz Creator | Enhanced quiz builder |
| `/add-question` | Add Question | Add questions to a quiz |
| `/view-questions` | View Questions | Browse and manage questions |
| `/upload-material` | Upload Material | Upload course materials |
| `/teacher-materials` | Teacher Materials | Manage uploaded materials |
| `/ai-quiz-generator` | AI Quiz Generator | Generate quizzes using AI |
| `/quiz-analytics/:quizId` | Quiz Analytics | View analytics for a quiz |
| `/quiz-result/:quizId` | Quiz Result | View results for a quiz |
| `/quiz-submissions/:quizId` | Quiz Submissions | Review student submissions |

### 👨‍🎓 Student Routes

| Path | Page | Description |
|------|------|-------------|
| `/student-dashboard` | Student Dashboard | Overview of student activities |
| `/take-quiz` | Take Quiz | Browse available quizzes |
| `/submit-quiz/:id` | Submit Quiz | Take and submit a quiz |
| `/student-response/:submissionId` | Student Response | Review a submitted response |

---

## 🗄️ State Management

### Redux Store — 3 Slices

```
┌──────────────────────────────────┐
│          Redux Store             │
│                                  │
│  ┌──────────┐  ┌──────────────┐  │
│  │  quiz     │  │  question    │  │
│  │  slice    │  │  slice       │  │
│  └──────────┘  └──────────────┘  │
│  ┌──────────────────────────┐    │
│  │  material slice          │    │
│  └──────────────────────────┘    │
└──────────────────────────────────┘
```

| Slice | Responsibilities |
|-------|-----------------|
| **quiz** | Quiz CRUD, listing, and async thunks |
| **question** | Question management and retrieval |
| **material** | Course material uploads and listing |

### AuthContext (React Context)

- Stores **JWT token** in `localStorage`
- Provides current **user info** (role, name, id) to the component tree
- Wraps the app to enable authentication-aware rendering

---

## 🧩 Components

| Component | Description |
|-----------|-------------|
| 🧭 **Header** | Top navigation bar with role-based menu items |
| 🔘 **Button** | Reusable styled button component |
| 🃏 **Card** | Content container card |
| 🔔 **Alert** | Notification / feedback messages |
| 🏷️ **Badge** | Status and label badges |
| ⏳ **LoadingSpinner** | Loading state indicator |
| 📭 **EmptyState** | Placeholder for empty data views |

---

## 📁 Project Structure

```
src/
├── api/              # Axios instances & API helpers
├── components/       # Reusable UI components
│   ├── Header
│   ├── Button
│   ├── Card
│   ├── Alert
│   ├── Badge
│   ├── LoadingSpinner
│   └── EmptyState
├── pages/            # Route-level page components
│   ├── Home
│   ├── Login
│   ├── Register
│   ├── TeacherDashboard
│   ├── StudentDashboard
│   ├── CreateQuiz
│   ├── AdvancedQuizCreator
│   ├── AIQuizGenerator
│   ├── TakeQuiz
│   ├── SubmitQuiz
│   └── ...
├── store/            # Redux Toolkit store & slices
│   ├── store.js
│   ├── quizSlice.js
│   ├── questionSlice.js
│   └── materialSlice.js
├── styles/           # Global SCSS stylesheets
├── App.jsx           # Root component with routes
└── main.jsx          # Entry point
```

---

## 🔌 API Integration

### Base URLs

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 **API Gateway** | `http://localhost:8765` | Routes requests to microservices |
| 🤖 **AI Service** | `http://localhost:8083` | AI-powered quiz generation |

### Axios Interceptor

All outgoing requests automatically include the JWT token:

```js
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

> Tokens are read from `localStorage` and attached as a `Bearer` token in the `Authorization` header on every request.

---

## 🚀 How to Run

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Development

```bash
# Install dependencies
npm install

# Start the development server (default: http://localhost:5173)
npm run dev
```

### Production Build

```bash
# Create an optimized production build
npm run build

# Preview the production build locally
npm run preview
```

---

## ⚙️ Environment / Configuration

The API base URLs are configured in the Axios setup files inside `src/api/`. To change the backend endpoints, update the following:

| Variable | Default Value | Description |
|----------|--------------|-------------|
| Gateway Base URL | `http://localhost:8765` | API Gateway for all microservice calls |
| AI Service Base URL | `http://localhost:8083` | AI quiz generation service |

> **Tip:** For production deployments, replace these URLs with your deployed service endpoints or use environment variables with Vite's `import.meta.env` system:
>
> ```env
> VITE_API_GATEWAY_URL=http://localhost:8765
> VITE_AI_SERVICE_URL=http://localhost:8083
> ```

---

<p align="center">
  Built with ⚛️ React &nbsp;·&nbsp; ⚡ Vite &nbsp;·&nbsp; 🗄️ Redux Toolkit
</p>
