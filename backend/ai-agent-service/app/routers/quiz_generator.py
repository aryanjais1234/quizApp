from typing import Optional

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException

from app.config import settings
from app.models.schemas import (
    GeneratedQuiz,
    QuizGenerationRequest,
    SaveQuizRequest,
)
from app.services.gemini_service import GeminiService
from app.services.rag_service import RAGService
from app.utils.auth import require_teacher, validate_token

router = APIRouter()

rag_service = RAGService()
gemini_service = GeminiService()


@router.post("/generate-quiz", response_model=GeneratedQuiz)
async def generate_quiz(
    request: QuizGenerationRequest,
    authorization: Optional[str] = Header(None),
    payload: dict = Depends(validate_token),
):
    """Generate quiz questions from uploaded study materials using RAG + Gemini.

    The generated quiz is **not** persisted — the teacher reviews it and
    decides whether to save it via POST /ai/quiz/save.
    """
    token = authorization[len("Bearer "):]

    # 1. Embed materials and retrieve relevant context via RAG
    context = await rag_service.retrieve_context(
        query=f"key concepts and topics about {request.category}",
        material_ids=request.material_ids,
        n_results=8,
        token=token,
    )

    if not context:
        raise HTTPException(
            status_code=404,
            detail=(
                "No text content found in the specified materials. "
                "Please add transcripts to your materials before generating a quiz."
            ),
        )

    # 2. Generate questions via Gemini
    questions, session_id = gemini_service.generate_quiz(
        context=context,
        num_questions=request.num_questions,
        difficulty=request.difficulty,
        category=request.category,
        session_id=request.session_id,
    )

    if not questions:
        raise HTTPException(
            status_code=500,
            detail=(
                "Gemini failed to generate quiz questions. "
                "Check your GEMINI_API_KEY and try again."
            ),
        )

    return GeneratedQuiz(
        questions=questions,
        session_id=session_id,
        context_used=(
            context[:500] + "..." if len(context) > 500 else context
        ),
        total_questions=len(questions),
    )


@router.post("/quiz/save")
async def save_quiz(
    request: SaveQuizRequest,
    authorization: Optional[str] = Header(None),
    payload: dict = Depends(require_teacher),
):
    """Persist a teacher-approved AI-generated quiz.

    Steps:
    1. Add questions to the question-service.
    2. Retrieve question IDs for the category via the generate endpoint.
    3. Create the quiz in the quiz-service with those IDs.
    """
    token = authorization[len("Bearer "):]
    username: str = payload.get("sub", "")

    questions_payload = [q.model_dump() for q in request.questions]

    async with httpx.AsyncClient() as client:
        # --- Step 1: persist questions ---
        q_response = await client.post(
            f"{settings.question_service_url}/question/addMultiple",
            json=questions_payload,
            timeout=30.0,
        )
        if q_response.status_code not in (200, 201):
            raise HTTPException(
                status_code=502,
                detail=f"Failed to save questions: {q_response.text}",
            )

        # --- Step 2: fetch question IDs for this category ---
        gen_response = await client.get(
            f"{settings.question_service_url}/question/generate",
            params={
                "categoryName": request.category,
                "numQuestions": request.num_questions,
            },
            timeout=30.0,
        )
        question_ids = (
            gen_response.json() if gen_response.status_code == 200 else []
        )

        # --- Step 3: create quiz ---
        quiz_payload = {
            "title": request.quiz_title,
            "categoryName": request.category,
            "numQuestions": request.num_questions,
            "questionIds": question_ids,
        }
        quiz_response = await client.post(
            f"{settings.quiz_service_url}/quiz/create",
            json=quiz_payload,
            headers={"username": username},
            timeout=30.0,
        )
        if quiz_response.status_code not in (200, 201):
            raise HTTPException(
                status_code=502,
                detail=f"Failed to create quiz: {quiz_response.text}",
            )

    return {"message": quiz_response.text, "saved": True}
