# Quiz AI Agent Service

A FastAPI microservice that powers AI-assisted quiz generation and student analysis for the QuizApp platform.  
It uses **Retrieval-Augmented Generation (RAG)** — embedding teacher-uploaded study materials into a local [ChromaDB](https://www.trychroma.com/) vector store — to feed relevant context to **Google Gemini**, which then generates tailored quiz questions.

---

## Architecture

```
frontend  ──► API Gateway (8765)  ──► Spring Boot microservices
              │
              └──► AI Agent Service (8083)  ──► Gemini API
                        │
                        ├── ChromaDB (local vector store)
                        ├── Sentence-Transformers (embeddings)
                        └── material-service / question-service / quiz-service
```

The AI service is called **directly** by the frontend on port `8083` (it does not route through the Spring Boot API Gateway).

---

## MCP Pattern

Inspired by the **Model Context Protocol (MCP)** pattern, the service is split into three clean layers:

| Layer | File | Responsibility |
|---|---|---|
| **Context Server** | `app/mcp/context_server.py` | Fetches study materials from `material-service` |
| **Memory** | `app/mcp/memory.py` | Per-session conversation history (in-memory) |
| **AI Agent** | `app/services/gemini_service.py` | Calls Gemini with context + history |

---

## Project Structure

```
backend/ai-agent-service/
├── app/
│   ├── main.py                      # FastAPI entry point, CORS, router registration
│   ├── config.py                    # Pydantic Settings (reads .env)
│   ├── routers/
│   │   ├── quiz_generator.py        # POST /ai/generate-quiz, POST /ai/quiz/save
│   │   ├── student_analysis.py      # POST /ai/analyze-student
│   │   └── chat_agent.py            # POST /ai/chat, DELETE /ai/chat/{session_id}
│   ├── services/
│   │   ├── document_processor.py    # PDF extraction + text chunking
│   │   ├── embedding_service.py     # Sentence-Transformers wrapper (singleton)
│   │   ├── vector_store.py          # ChromaDB CRUD operations
│   │   ├── rag_service.py           # Full RAG pipeline (embed → store → retrieve)
│   │   └── gemini_service.py        # Gemini API wrapper with JSON parsing
│   ├── models/
│   │   ├── schemas.py               # Pydantic request/response models
│   │   └── prompts.py               # LLM prompt templates
│   ├── mcp/
│   │   ├── memory.py                # In-memory session history (MCP Memory)
│   │   └── context_server.py        # Material access layer (MCP Context Server)
│   └── utils/
│       └── auth.py                  # JWT validation matching Spring Boot HS256
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

---

## API Endpoints

### Quiz Generation

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/ai/generate-quiz` | JWT (any role) | Generate quiz questions from materials |
| `POST` | `/ai/quiz/save` | JWT (TEACHER) | Persist the generated quiz to the DB |

**Generate Quiz — Request Body**
```json
{
  "material_ids": [1, 2],
  "num_questions": 10,
  "difficulty": "medium",
  "quiz_title": "Chapter 1 Assessment",
  "category": "Computer Science",
  "session_id": "optional-uuid"
}
```

**Generate Quiz — Response**
```json
{
  "questions": [
    {
      "questionTitle": "What is a variable in programming?",
      "option1": "A storage location with a name",
      "option2": "A type of loop",
      "option3": "A function parameter",
      "option4": "A database record",
      "rightAnswer": "A storage location with a name",
      "difficultylevel": "medium",
      "category": "Computer Science"
    }
  ],
  "session_id": "abc-123",
  "context_used": "The study material discusses...",
  "total_questions": 10
}
```

**Save Quiz — Request Body**
```json
{
  "questions": [ /* same format as above */ ],
  "quiz_title": "Chapter 1 Assessment",
  "category": "Computer Science",
  "num_questions": 10
}
```

---

### Student Analysis

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/ai/analyze-student` | JWT (any role) | Analyse student quiz performance |

**Request Body**
```json
{
  "student_username": "john_doe",
  "quiz_id": 42,
  "score": 7,
  "total": 10,
  "responses": [{"response": "A storage location with a name"}],
  "questions": [{"questionTitle": "What is a variable?", "rightAnswer": "A storage location with a name"}]
}
```

---

### Chat Agent

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/ai/chat` | JWT (any role) | Chat with AI grounded in study materials |
| `DELETE` | `/ai/chat/{session_id}` | JWT (any role) | Clear conversation history |

**Request Body**
```json
{
  "message": "Explain recursion with an example",
  "session_id": "my-session",
  "material_ids": [1, 2]
}
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- A [Google AI Studio](https://aistudio.google.com/) API key (Gemini)
- Running QuizApp microservices (material-service on 8082, question-service on 8086, quiz-service on 8081)

### Local Development

```bash
cd backend/ai-agent-service

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env and set GEMINI_API_KEY

# 4. Start the service
uvicorn app.main:app --host 0.0.0.0 --port 8083 --reload
```

The service will be available at **http://localhost:8083**.  
Interactive API docs: **http://localhost:8083/docs**

### Docker

```bash
cd backend/ai-agent-service

# Build
docker build -t quiz-ai-agent .

# Run
docker run -p 8083:8083 \
  -e GEMINI_API_KEY=your_key \
  -e MATERIAL_SERVICE_URL=http://host.docker.internal:8082 \
  -e QUESTION_SERVICE_URL=http://host.docker.internal:8086 \
  -e QUIZ_SERVICE_URL=http://host.docker.internal:8081 \
  quiz-ai-agent
```

### Docker Compose

The `docker-compose.yml` in `backend/microservices/` already includes the AI service.

```bash
cd backend/microservices

# Copy and edit the env file
cp .env.example .env  # set GEMINI_API_KEY

docker compose up --build
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | *(required)* | Google Gemini API key |
| `JWT_SECRET` | *(Spring Boot secret)* | Must match `user-service` secret |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm |
| `CHROMA_PERSIST_DIR` | `./chroma_data` | ChromaDB storage path |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | Sentence-Transformer model name |
| `MATERIAL_SERVICE_URL` | `http://localhost:8082` | material-service base URL |
| `QUESTION_SERVICE_URL` | `http://localhost:8086` | question-service base URL |
| `QUIZ_SERVICE_URL` | `http://localhost:8081` | quiz-service base URL |

---

## How the RAG Pipeline Works

```
Teacher uploads material  →  material-service stores transcript
                                       │
Teacher clicks "Generate Quiz"         │
         │                             │
         ▼                             ▼
  POST /ai/generate-quiz    ←  fetch transcript from material-service
         │
         ▼
  chunk text (1000-char chunks, 200-char overlap)
         │
         ▼
  embed chunks (Sentence-Transformers all-MiniLM-L6-v2)
         │
         ▼
  store in ChromaDB (persistent local vector store)
         │
         ▼
  embed query → cosine similarity search → top-8 chunks
         │
         ▼
  build prompt with context → Gemini API → JSON questions
         │
         ▼
  return GeneratedQuiz to frontend
         │
  Teacher reviews questions
         │
  ┌──────┴──────┐
  │  Save       │  Discard
  ▼             ▼
POST /ai/quiz/save   (nothing persisted)
  │
  ├── POST /question/addMultiple  →  question-service
  ├── GET  /question/generate     →  fetch IDs
  └── POST /quiz/create           →  quiz-service
```

---

## Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| FastAPI | 0.109.0 | REST API framework |
| Uvicorn | 0.27.0 | ASGI server |
| google-generativeai | 0.3.2 | Gemini API client |
| chromadb | 0.4.22 | Local vector database |
| sentence-transformers | 2.4.0 | Text embeddings |
| langchain | 0.1.5 | Orchestration utilities |
| PyPDF2 / pdfplumber | 3.0.1 / 0.10.3 | PDF text extraction |
| httpx | 0.26.0 | Async HTTP client |
| PyJWT | 2.8.0 | JWT validation |
| pydantic-settings | 2.1.0 | Configuration management |
