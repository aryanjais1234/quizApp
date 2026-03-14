from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class QuizGenerationRequest(BaseModel):
    material_ids: List[int]
    num_questions: int = 10
    difficulty: str = "medium"
    quiz_title: str
    category: str
    session_id: Optional[str] = None


class GeneratedQuestion(BaseModel):
    questionTitle: str
    option1: str
    option2: str
    option3: str
    option4: str
    rightAnswer: str
    difficultylevel: str
    category: str


class GeneratedQuiz(BaseModel):
    questions: List[GeneratedQuestion]
    session_id: str
    context_used: Optional[str] = None
    total_questions: int


class SaveQuizRequest(BaseModel):
    questions: List[GeneratedQuestion]
    quiz_title: str
    category: str
    num_questions: int


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"
    material_ids: Optional[List[int]] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str


class StudentAnalysisRequest(BaseModel):
    student_username: str
    quiz_id: int
    responses: List[Dict[str, Any]]
    questions: List[Dict[str, Any]]
    score: Optional[int] = None
    total: Optional[int] = None
    session_id: Optional[str] = None


class StudentAnalysisResponse(BaseModel):
    analysis: str
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    session_id: str
