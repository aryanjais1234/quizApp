QUIZ_GENERATION_PROMPT = """You are an expert quiz creator for educational purposes.

Based on the following study material content, create exactly {num_questions} quiz questions.

STUDY MATERIAL:
{context}

REQUIREMENTS:
- Difficulty level: {difficulty}
- Category: {category}
- Create multiple-choice questions with exactly 4 options each
- Ensure one clear correct answer per question
- Make distractors plausible but clearly incorrect
- Cover the key concepts from the material

You MUST respond with ONLY a valid JSON array. No explanation, no markdown, just the raw JSON array.

Format each question exactly as:
{{
  "questionTitle": "...",
  "option1": "...",
  "option2": "...",
  "option3": "...",
  "option4": "...",
  "rightAnswer": "exact text of the correct option (must match one of option1-option4)",
  "difficultylevel": "{difficulty}",
  "category": "{category}"
}}

Return ONLY a JSON array of exactly {num_questions} question objects. No extra text."""


STUDENT_ANALYSIS_PROMPT = """You are an expert educational analyst.

Analyze the following student quiz performance:

Student: {student_username}
Score: {score}/{total}
Percentage: {percentage:.1f}%

QUESTIONS AND RESPONSES:
{question_responses}

Provide a detailed analysis.

Respond with ONLY a valid JSON object (no markdown, no explanation):
{{
  "analysis": "Overall performance paragraph here...",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}}"""


CHAT_PROMPT = """You are a helpful educational assistant for a quiz platform.

{context_section}Use the provided study material context to answer questions accurately.
If the answer is not in the context, say so clearly but still try to help based on general knowledge.

Previous conversation:
{history}

Current question: {question}

Provide a clear, educational response."""
