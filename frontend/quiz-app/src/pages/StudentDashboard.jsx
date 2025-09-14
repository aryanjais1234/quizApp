import { useState, useEffect } from "react";
import { getStudentQuizHistory } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== "ROLE_STUDENT") {
      navigate("/login");
      return;
    }

    fetchQuizHistory();
  }, [isAuthenticated, user, navigate]);

  const fetchQuizHistory = async () => {
    try {
      setLoading(true);
      const response = await getStudentQuizHistory();
      setQuizHistory(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching quiz history:", err);
      setError("Failed to load your quiz history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScorePercentage = (score, total) => {
    return Math.round((score / total) * 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (_error) {
      return dateString; // Return as-is if parsing fails
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "#28a745";
    if (percentage >= 60) return "#ffc107";
    return "#dc3545";
  };

  const getGradeEmoji = (percentage) => {
    if (percentage >= 90) return "🏆";
    if (percentage >= 80) return "🥇";
    if (percentage >= 70) return "🥈";
    if (percentage >= 60) return "🥉";
    return "📚";
  };

  const calculateStats = () => {
    if (quizHistory.length === 0)
      return { totalQuizzes: 0, averageScore: 0, bestScore: 0 };
    console.log("Calculating stats from quiz history:", quizHistory);
    const totalQuizzes = quizHistory.length;
    const scores = quizHistory.map(
      (quiz) =>
        quiz.percentage || getScorePercentage(quiz.score, quiz.totalQuestions)
    );
    const averageScore = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length
    );
    const bestScore = Math.max(...scores);

    return { totalQuizzes, averageScore, bestScore };
  };

  const stats = calculateStats();

  if (!isAuthenticated() || user?.role !== "ROLE_STUDENT") {
    return null;
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Loading your dashboard...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          borderBottom: "2px solid #e9ecef",
          paddingBottom: "1rem",
        }}
      >
        <h1 style={{ color: "#343a40", margin: 0 }}>My Learning Dashboard</h1>
        <button
          onClick={() => navigate("/take-quiz")}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
            fontSize: "1rem",
          }}
        >
          Take New Quiz
        </button>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dee2e6",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📊</div>
          <h3
            style={{
              color: "#007bff",
              margin: "0 0 0.5rem 0",
              fontSize: "2rem",
            }}
          >
            {stats.totalQuizzes}
          </h3>
          <p style={{ color: "#6c757d", margin: 0, fontWeight: "500" }}>
            Quizzes Completed
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dee2e6",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📈</div>
          <h3
            style={{
              color: getScoreColor(stats.averageScore),
              margin: "0 0 0.5rem 0",
              fontSize: "2rem",
            }}
          >
            {stats.averageScore}%
          </h3>
          <p style={{ color: "#6c757d", margin: 0, fontWeight: "500" }}>
            Average Score
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dee2e6",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏆</div>
          <h3
            style={{
              color: getScoreColor(stats.bestScore),
              margin: "0 0 0.5rem 0",
              fontSize: "2rem",
            }}
          >
            {stats.bestScore}%
          </h3>
          <p style={{ color: "#6c757d", margin: 0, fontWeight: "500" }}>
            Best Score
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb",
            borderRadius: "4px",
            marginBottom: "1.5rem",
          }}
        >
          {error}
        </div>
      )}

      <h2 style={{ color: "#343a40", marginBottom: "1.5rem" }}>Quiz History</h2>

      {quizHistory.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "2px dashed #dee2e6",
          }}
        >
          <h3 style={{ color: "#6c757d", marginBottom: "1rem" }}>
            No Quiz History Yet
          </h3>
          <p style={{ color: "#6c757d", marginBottom: "1.5rem" }}>
            Start taking quizzes to track your progress and improve your skills.
          </p>
          <button
            onClick={() => navigate("/take-quiz")}
            style={{
              padding: "0.75rem 2rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "1rem",
            }}
          >
            Take Your First Quiz
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {quizHistory.map((quiz) => {
            const percentage =
              quiz.percentage ||
              getScorePercentage(quiz.score, quiz.totalQuestions);
            return (
              <div
                key={quiz.id}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #dee2e6",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  transition: "box-shadow 0.3s ease, transform 0.3s ease",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/quiz-result/${quiz.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.15)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1rem",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        color: "#343a40",
                        margin: "0 0 0.5rem 0",
                        fontSize: "1.25rem",
                        fontWeight: "600",
                      }}
                    >
                      {quiz.quizTitle || `Quiz ${quiz.id}`}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "#007bff",
                          color: "white",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                        }}
                      >
                        {quiz.category}
                      </span>
                      <span style={{ color: "#6c757d", fontSize: "0.875rem" }}>
                        Quiz ID: {quiz.quizId}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: getScoreColor(percentage),
                        marginBottom: "0.25rem",
                      }}
                    >
                      {getGradeEmoji(percentage)} {Math.round(percentage)}%
                    </div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "#6c757d",
                      }}
                    >
                      {quiz.score}/{quiz.totalQuestions} correct
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#6c757d",
                    fontSize: "0.875rem",
                  }}
                >
                  <span>📅 {formatDate(quiz.submittedAt)}</span>
                  <span
                    style={{
                      color: "#007bff",
                      textDecoration: "underline",
                      fontWeight: "500",
                    }}
                  >
                    View Details →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
