from dotenv import load_dotenv

load_dotenv()  # load .env into os.environ before any module initialises

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import chat_agent, quiz_generator, student_analysis

app = FastAPI(
    title="Quiz AI Agent Service",
    description=(
        "AI-powered quiz generation and student analysis "
        "using RAG (ChromaDB + Sentence-Transformers) and Google Gemini."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz_generator.router, prefix="/ai", tags=["Quiz Generation"])
app.include_router(
    student_analysis.router, prefix="/ai", tags=["Student Analysis"]
)
app.include_router(chat_agent.router, prefix="/ai", tags=["Chat Agent"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "Quiz AI Agent Service is running", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
