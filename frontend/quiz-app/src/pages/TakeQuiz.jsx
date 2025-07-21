import { useState } from "react";
import { getQuizQuestions, submitQuiz } from "../api/api";

const TakeQuiz = () => {
  const [quizId, setQuizId] = useState(""); // User input for quiz ID
  const [questions, setQuestions] = useState([]); // Quiz questions
  const [answers, setAnswers] = useState({}); // User's selected answers
  const [error, setError] = useState(""); // Error message
  const [score, setScore] = useState(null); // Final score after submission

  // Handle radio button change
  const handleChange = (qid, ans) => {
    setAnswers((prev) => ({ ...prev, [qid]: ans }));
  };

  // Fetch quiz questions
  const fetchQuiz = async () => {
    try {
      const res = await getQuizQuestions(quizId);
      setQuestions(res.data);
      setError("");
      setScore(null); // Reset score when starting a new quiz
      setAnswers({});
    } catch (err) {
      setError("❌ Invalid Quiz ID or failed to fetch questions.");
      setQuestions([]);
      setScore(null);
    }
  };

  // Submit quiz responses
  const handleSubmit = async () => {
    const formatted = questions.map((q) => ({
      questionId: q.id,
      response: answers[q.id] || "",
    }));

    try {
      const result = await submitQuiz(quizId, formatted);
      setScore(result); // ✅ Save and display score
    } catch (err) {
      console.error("❌ Error submitting quiz:", err);
      setError("Failed to submit quiz. Please try again.");
      setScore(null);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📝 Take a Quiz</h2>

      {/* Quiz ID Input */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={quizId}
          onChange={(e) => setQuizId(e.target.value)}
          placeholder="Enter Quiz ID"
        />
        <button onClick={fetchQuiz} style={{ marginLeft: "0.5rem" }}>
          Start Quiz
        </button>
      </div>

      {/* Error Message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Quiz Questions */}
      {questions.length > 0 && (
        <div>
          {questions.map((q, i) => (
            <div key={q.id} style={{ marginBottom: "1.5rem" }}>
              <p>
                <strong>
                  {i + 1}. {q.questionTitle}
                </strong>
              </p>
              {["option1", "option2", "option3", "option4"].map((opt) => (
                <label key={opt} style={{ display: "block" }}>
                  <input
                    type="radio"
                    name={q.id}
                    value={q[opt]}
                    checked={answers[q.id] === q[opt]}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  />
                  {q[opt]}
                </label>
              ))}
            </div>
          ))}
          <button onClick={handleSubmit}>Submit Quiz</button>
        </div>
      )}

      {/* Final Score */}
      {score !== null && (
        <p style={{ marginTop: "1.5rem", fontWeight: "bold", fontSize: "1.2rem" }}>
          🎯 Your Score: {score} / {questions.length}
        </p>
      )}
    </div>
  );
};

export default TakeQuiz;
