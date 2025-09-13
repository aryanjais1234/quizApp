import { useState } from "react";
import { getQuizQuestions, submitQuiz } from "../api/api";
import { useAuth } from "../context/AuthContext";

const TakeQuiz = () => {
  const [quizId, setQuizId] = useState(""); // User input for quiz ID
  const [questions, setQuestions] = useState([]); // Quiz questions
  const [answers, setAnswers] = useState({}); // User's selected answers
  const [error, setError] = useState(""); // Error message
  const [score, setScore] = useState(null); // Final score after submission
  const [loading, setLoading] = useState(false);
  
  const { isAuthenticated } = useAuth();

  // Handle radio button change
  const handleChange = (qid, ans) => {
    setAnswers((prev) => ({ ...prev, [qid]: ans }));
  };

  // Fetch quiz questions
  const fetchQuiz = async () => {
    if (!isAuthenticated()) {
      setError("Please login to take a quiz.");
      return;
    }

    if (!quizId.trim()) {
      setError("Please enter a quiz ID.");
      return;
    }

    setLoading(true);
    try {
      const res = await getQuizQuestions(quizId);
      setQuestions(res.data);
      setError("");
      setScore(null); // Reset score when starting a new quiz
      setAnswers({});
    } catch (err) {
      console.error("Fetch quiz error:", err);
      setError("❌ Invalid Quiz ID or failed to fetch questions.");
      setQuestions([]);
      setScore(null);
    } finally {
      setLoading(false);
    }
  };

  // Submit quiz responses
  const handleSubmit = async () => {
    if (!isAuthenticated()) {
      setError("Please login to submit the quiz.");
      return;
    }

    const formatted = questions.map((q) => ({
      questionId: q.id,
      response: answers[q.id] || "",
    }));

    setLoading(true);
    try {
      const result = await submitQuiz(quizId, formatted);
      setScore(result); // ✅ Save and display score
      setError("");
    } catch (err) {
      console.error("❌ Error submitting quiz:", err);
      setError("Failed to submit quiz. Please try again.");
      setScore(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>📝 Take a Quiz</h2>
        <p>Please <a href="/login">login</a> to take a quiz.</p>
      </div>
    );
  }

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
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        />
        <button 
          onClick={fetchQuiz}
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Loading..." : "Start Quiz"}
        </button>
      </div>

      {/* Error Message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Quiz Questions */}
      {questions.length > 0 && (
        <div>
          {questions.map((q, i) => (
            <div key={q.id} style={{ marginBottom: "1.5rem", padding: "1rem", border: "1px solid #ddd", borderRadius: "4px" }}>
              <p>
                <strong>
                  {i + 1}. {q.questionTitle}
                </strong>
              </p>
              {["option1", "option2", "option3", "option4"].map((opt) => (
                <label key={opt} style={{ display: "block", marginBottom: "0.25rem" }}>
                  <input
                    type="radio"
                    name={q.id}
                    value={q[opt]}
                    checked={answers[q.id] === q[opt]}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    style={{ marginRight: "0.5rem" }}
                  />
                  {q[opt]}
                </label>
              ))}
            </div>
          ))}
          <button 
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem"
            }}
          >
            {loading ? "Submitting..." : "Submit Quiz"}
          </button>
        </div>
      )}

      {/* Final Score */}
      {score !== null && (
        <div style={{ 
          marginTop: "1.5rem", 
          padding: "1rem",
          backgroundColor: "#d4edda",
          color: "#155724",
          borderRadius: "4px",
          textAlign: "center"
        }}>
          <h3>🎯 Your Score: {score} / {questions.length}</h3>
          <p>
            {score === questions.length ? "Perfect score! 🎉" : 
             score >= questions.length * 0.8 ? "Great job! 👏" :
             score >= questions.length * 0.6 ? "Good effort! 👍" :
             "Keep practicing! 💪"}
          </p>
        </div>
      )}
    </div>
  );
};

export default TakeQuiz;
