import json
import re
import uuid
from typing import Any, Dict, List, Optional, Tuple

from fastapi import HTTPException
from google import genai

from app.config import settings
from app.mcp.memory import append_assistant, append_user, get_history
from app.models.prompts import (
    CHAT_PROMPT,
    QUIZ_GENERATION_PROMPT,
    STUDENT_ANALYSIS_PROMPT,
)
from app.models.schemas import GeneratedQuestion


class GeminiService:
    """Wrapper around the Google Generative AI (Gemini) API using google-genai SDK."""

    def __init__(self):
        # Lazily initialize the Gemini client to avoid crashing app startup
        # when env vars are not configured yet.
        self._client = None
        self._model = settings.gemini_model

    def _get_client(self):
        if self._client is not None:
            return self._client

        api_key = (settings.gemini_api_key or "").strip()
        if not api_key or api_key == "replace_with_real_gemini_key":
            raise HTTPException(
                status_code=503,
                detail=(
                    "GEMINI_API_KEY is not configured. "
                    "Set it in backend/ai-agent-service/.env and restart the service."
                ),
            )

        try:
            self._client = genai.Client(api_key=api_key)
        except Exception as exc:
            raise HTTPException(
                status_code=503,
                detail=f"Failed to initialize Gemini client: {exc}",
            ) from exc

        return self._client

    def _generate(self, prompt: str) -> str:
        """Call Gemini and return the response text."""
        client = self._get_client()
        response = client.models.generate_content(
            model=self._model,
            contents=prompt,
        )
        return response.text.strip()

    # ------------------------------------------------------------------
    # Quiz generation
    # ------------------------------------------------------------------

    def generate_quiz(
        self,
        context: str,
        num_questions: int,
        difficulty: str,
        category: str,
        session_id: Optional[str] = None,
    ) -> Tuple[List[GeneratedQuestion], str]:
        """Generate quiz questions from *context* using Gemini."""
        if not session_id:
            session_id = str(uuid.uuid4())

        # Truncate context to avoid exceeding the model's context window
        trimmed_context = context[:8000] if len(context) > 8000 else context

        prompt = QUIZ_GENERATION_PROMPT.format(
            context=trimmed_context,
            num_questions=num_questions,
            difficulty=difficulty,
            category=category,
        )

        append_user(
            session_id,
            f"Generate {num_questions} {difficulty} questions for category: {category}",
        )

        raw_text = self._generate(prompt)
        questions = self._parse_questions(raw_text, difficulty, category)

        append_assistant(session_id, f"Generated {len(questions)} questions")
        return questions, session_id

    # ------------------------------------------------------------------
    # Student analysis
    # ------------------------------------------------------------------

    def analyze_student(
        self,
        student_username: str,
        score: int,
        total: int,
        question_responses: str,
        session_id: Optional[str] = None,
    ) -> Tuple[Dict[str, Any], str]:
        """Return an AI-powered analysis of a student's quiz performance."""
        if not session_id:
            session_id = str(uuid.uuid4())

        percentage = (score / total * 100) if total > 0 else 0.0

        prompt = STUDENT_ANALYSIS_PROMPT.format(
            student_username=student_username,
            score=score,
            total=total,
            percentage=percentage,
            question_responses=question_responses,
        )

        raw_text = self._generate(prompt)
        analysis = self._parse_analysis(raw_text)
        return analysis, session_id

    # ------------------------------------------------------------------
    # Chat
    # ------------------------------------------------------------------

    def chat(self, question: str, context: str, session_id: str) -> str:
        """Answer *question* using material context and conversation history."""
        history = get_history(session_id, limit=6)
        history_text = (
            "\n".join(
                f"{m['role'].capitalize()}: {m['content']}" for m in history
            )
            if history
            else "No previous conversation."
        )

        context_section = (
            f"STUDY MATERIAL CONTEXT:\n{context}\n\n" if context else ""
        )

        prompt = CHAT_PROMPT.format(
            context_section=context_section,
            history=history_text,
            question=question,
        )

        append_user(session_id, question)
        answer = self._generate(prompt)
        append_assistant(session_id, answer)
        return answer

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _clean_json_text(raw: str) -> str:
        """Strip markdown fences and extract the first JSON structure."""
        text = raw
        if "```" in text:
            for part in text.split("```"):
                part = part.strip()
                if part.startswith("json"):
                    text = part[4:].strip()
                    break
                if part.startswith(("[", "{")):
                    text = part
                    break

        # Try to extract a JSON array or object
        for pattern in (r"\[.*\]", r"\{.*\}"):
            match = re.search(pattern, text, re.DOTALL)
            if match:
                return match.group(0)

        return text

    def _parse_questions(
        self, raw_text: str, difficulty: str, category: str
    ) -> List[GeneratedQuestion]:
        """Parse a Gemini JSON response into GeneratedQuestion objects."""
        text = self._clean_json_text(raw_text)
        try:
            data = json.loads(text)
            if isinstance(data, dict):
                data = [data]

            questions: List[GeneratedQuestion] = []
            for item in data:
                opts = item.get("options", [])
                questions.append(
                    GeneratedQuestion(
                        questionTitle=item.get(
                            "questionTitle", item.get("question", "")
                        ),
                        option1=item.get(
                            "option1", opts[0] if len(opts) > 0 else ""
                        ),
                        option2=item.get(
                            "option2", opts[1] if len(opts) > 1 else ""
                        ),
                        option3=item.get(
                            "option3", opts[2] if len(opts) > 2 else ""
                        ),
                        option4=item.get(
                            "option4", opts[3] if len(opts) > 3 else ""
                        ),
                        rightAnswer=item.get(
                            "rightAnswer", item.get("correct_answer", "")
                        ),
                        difficultylevel=item.get("difficultylevel", difficulty),
                        category=item.get("category", category),
                    )
                )
            return questions

        except Exception as exc:
            print(
                f"[GeminiService] Failed to parse questions: {exc}\n"
                f"Raw text (first 500 chars): {raw_text[:500]}"
            )
            return []

    def _parse_analysis(self, raw_text: str) -> Dict[str, Any]:
        """Parse a Gemini JSON response into an analysis dict."""
        text = self._clean_json_text(raw_text)
        try:
            return json.loads(text)
        except Exception:
            return {
                "analysis": raw_text,
                "strengths": [],
                "weaknesses": [],
                "recommendations": [],
            }
