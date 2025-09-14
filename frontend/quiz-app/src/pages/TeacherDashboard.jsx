import { useState, useEffect } from "react";
import { getTeacherQuizzes } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== "ROLE_TEACHER") {
      navigate("/login");
      return;
    }

    fetchTeacherQuizzes();
  }, [isAuthenticated, user, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString; // Return as-is if parsing fails
    }
  };

  const fetchTeacherQuizzes = async () => {
    try {
      setLoading(true);
      const response = await getTeacherQuizzes();
      setQuizzes(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching teacher quizzes:", err);
      setError("Failed to load your quizzes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated() || user?.role !== "ROLE_TEACHER") {
    return null;
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Loading your quizzes...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "2rem",
        borderBottom: "2px solid #e9ecef",
        paddingBottom: "1rem"
      }}>
        <h1 style={{ color: "#343a40", margin: 0 }}>My Quizzes Dashboard</h1>
        <button
          onClick={() => navigate("/create-quiz")}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
            fontSize: "1rem"
          }}
        >
          + Create New Quiz
        </button>
      </div>

      {error && (
        <div style={{
          padding: "1rem",
          backgroundColor: "#f8d7da",
          color: "#721c24",
          border: "1px solid #f5c6cb",
          borderRadius: "4px",
          marginBottom: "1.5rem"
        }}>
          {error}
        </div>
      )}

      {quizzes.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "3rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "2px dashed #dee2e6"
        }}>
          <h3 style={{ color: "#6c757d", marginBottom: "1rem" }}>No Quizzes Created Yet</h3>
          <p style={{ color: "#6c757d", marginBottom: "1.5rem" }}>
            Start creating quizzes to build your question bank and engage students.
          </p>
          <button
            onClick={() => navigate("/create-quiz")}
            style={{
              padding: "0.75rem 2rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "1rem"
            }}
          >
            Create Your First Quiz
          </button>
        </div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "1.5rem"
        }}>
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #dee2e6",
                borderRadius: "12px",
                padding: "1.5rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                transition: "box-shadow 0.3s ease, transform 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-start",
                marginBottom: "1rem"
              }}>
                <h3 style={{ 
                  color: "#343a40", 
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: "600"
                }}>
                  {quiz.title}
                </h3>
                <span style={{
                  backgroundColor: "#e9ecef",
                  color: "#495057",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: "500"
                }}>
                  ID: {quiz.id}
                </span>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <p style={{ 
                  margin: "0.5rem 0", 
                  color: "#6c757d",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <span style={{ fontWeight: "500", color: "#495057" }}>Category:</span>
                  <span style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.875rem"
                  }}>
                    {quiz.categoryName}
                  </span>
                </p>
                <p style={{ margin: "0.5rem 0", color: "#6c757d" }}>
                  <span style={{ fontWeight: "500", color: "#495057" }}>Questions:</span> {quiz.numQuestions}
                </p>
                <p style={{ margin: "0.5rem 0", color: "#6c757d" }}>
                  <span style={{ fontWeight: "500", color: "#495057" }}>Created:</span> {formatDate(quiz.createdDate)}
                </p>
                <p style={{ margin: "0.5rem 0", color: "#6c757d" }}>
                  <span style={{ fontWeight: "500", color: "#495057" }}>Student Attempts:</span> 
                  <span style={{ 
                    color: quiz.attemptCount > 0 ? "#28a745" : "#ffc107",
                    fontWeight: "600",
                    marginLeft: "0.5rem"
                  }}>
                    {quiz.attemptCount || 0}
                  </span>
                </p>
              </div>

              <div style={{ 
                display: "flex", 
                gap: "0.75rem",
                marginTop: "1.5rem"
              }}>
                <button
                  onClick={() => navigate(`/quiz-analytics/${quiz.id}`)}
                  style={{
                    flex: 1,
                    padding: "0.5rem 1rem",
                    backgroundColor: "#17a2b8",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "0.875rem"
                  }}
                >
                  View Analytics
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(quiz.id)}
                  style={{
                    flex: 1,
                    padding: "0.5rem 1rem",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "0.875rem"
                  }}
                >
                  Copy Quiz ID
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;