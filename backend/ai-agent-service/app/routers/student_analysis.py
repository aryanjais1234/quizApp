from fastapi import APIRouter, Depends

from app.models.schemas import StudentAnalysisRequest, StudentAnalysisResponse
from app.services.gemini_service import GeminiService
from app.utils.auth import validate_token

router = APIRouter()

gemini_service = GeminiService()


@router.post("/analyze-student", response_model=StudentAnalysisResponse)
async def analyze_student(
    request: StudentAnalysisRequest,
    payload: dict = Depends(validate_token),
):
    """Return an AI-powered analysis of a student's quiz performance."""
    # Build a human-readable question/response summary
    qa_pairs = []
    for idx, (resp, question) in enumerate(
        zip(request.responses, request.questions), start=1
    ):
        correct_answer = question.get("rightAnswer") or question.get(
            "correctAnswer", "N/A"
        )
        student_answer = resp.get("response", "N/A")
        is_correct = student_answer == correct_answer

        qa_pairs.append(
            f"Q{idx}: {question.get('questionTitle', question.get('title', 'N/A'))}\n"
            f"   Student Answer : {student_answer}\n"
            f"   Correct Answer : {correct_answer}\n"
            f"   Result         : {'✓ Correct' if is_correct else '✗ Wrong'}"
        )

    question_responses = "\n\n".join(qa_pairs)

    total = request.total or len(request.questions)
    score = request.score
    if score is None:
        score = sum(
            1
            for resp, q in zip(request.responses, request.questions)
            if resp.get("response")
            == (q.get("rightAnswer") or q.get("correctAnswer", ""))
        )

    analysis_data, session_id = gemini_service.analyze_student(
        student_username=request.student_username,
        score=score,
        total=total,
        question_responses=question_responses,
        session_id=request.session_id,
    )

    return StudentAnalysisResponse(
        analysis=analysis_data.get("analysis", ""),
        strengths=analysis_data.get("strengths", []),
        weaknesses=analysis_data.get("weaknesses", []),
        recommendations=analysis_data.get("recommendations", []),
        session_id=session_id,
    )
