import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Header

from app.mcp.memory import clear_session
from app.models.schemas import ChatRequest, ChatResponse
from app.services.gemini_service import GeminiService
from app.services.rag_service import RAGService
from app.utils.auth import validate_token

router = APIRouter()

rag_service = RAGService()
gemini_service = GeminiService()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    authorization: Optional[str] = Header(None),
    payload: dict = Depends(validate_token),
):
    """AI chat with optional study-material context.

    Pass `material_ids` to ground the assistant in specific materials.
    The session history is stored in memory per `session_id`.
    """
    session_id = request.session_id or str(uuid.uuid4())

    # Retrieve relevant context from materials if provided
    context = ""
    if request.material_ids and authorization:
        token = authorization[len("Bearer "):]
        context = await rag_service.retrieve_context(
            query=request.message,
            material_ids=request.material_ids,
            n_results=4,
            token=token,
        )

    response = gemini_service.chat(
        question=request.message,
        context=context,
        session_id=session_id,
    )

    return ChatResponse(response=response, session_id=session_id)


@router.delete("/chat/{session_id}")
async def clear_chat_session(
    session_id: str,
    payload: dict = Depends(validate_token),
):
    """Clear the conversation history for a session."""
    clear_session(session_id)
    return {"message": f"Session '{session_id}' cleared successfully"}
