import { useState, useEffect } from "react";
import { getQuizAnalytics } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";

const QuizAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { quizId } = useParams();

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== "ROLE_TEACHER") {
      navigate("/login");
      return;
    }

    fetchQuizAnalytics();
  }, [isAuthenticated, user, navigate, quizId]);

  const fetchQuizAnalytics = async () => {
    try {
      setLoading(true);
      const response = await getQuizAnalytics(quizId);
      setAnalytics(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching quiz analytics:", err);
      setError("Failed to load quiz analytics. Please try again.");
      // For now, using mock data since backend endpoint doesn't exist yet
      setAnalytics({
        quiz: {
          id: quizId,
          title: "Java Basics Quiz",
          category: "Java",
          totalQuestions: 5,
          createdDate: "2024-01-15"
        },
        attempts: [
          {
            id: 1,
            studentName: "John Doe",
            studentId: "student1",
            score: 4,
            totalQuestions: 5,
            completedAt: "2024-01-20 10:30:00",
            timeSpent: "8 minutes",
            percentage: 80
          },
          {
            id: 2,
            studentName: "Jane Smith",
            studentId: "student2",
            score: 5,
            totalQuestions: 5,
            completedAt: "2024-01-20 14:15:00",
            timeSpent: "6 minutes",
            percentage: 100
          },
          {
            id: 3,
            studentName: "Bob Johnson",
            studentId: "student3",
            score: 3,
            totalQuestions: 5,
            completedAt: "2024-01-21 09:45:00",
            timeSpent: "12 minutes",
            percentage: 60
          },
          {
            id: 4,
            studentName: "Alice Brown",
            studentId: "student4",
            score: 4,
            totalQuestions: 5,
            completedAt: "2024-01-21 16:20:00",
            timeSpent: "9 minutes",
            percentage: 80
          }
        ]
      });
    } finally {
      setLoading(false);
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
    if (!analytics?.attempts || analytics.attempts.length === 0) {
      return { totalAttempts: 0, averageScore: 0, highestScore: 0, passRate: 0 };
    }

    const attempts = analytics.attempts;
    const totalAttempts = attempts.length;
    const averageScore = Math.round(
      attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts
    );
    const highestScore = Math.max(...attempts.map(attempt => attempt.percentage));
    const passRate = Math.round(
      (attempts.filter(attempt => attempt.percentage >= 60).length / totalAttempts) * 100
    );

    return { totalAttempts, averageScore, highestScore, passRate };
  };

  if (!isAuthenticated() || user?.role !== "ROLE_TEACHER") {
    return null;
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Loading quiz analytics...</h2>
      </div>
    );
  }

  const stats = calculateStats();

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
        <div>
          <h1 style={{ color: "#343a40", margin: 0 }}>Quiz Analytics</h1>
          {analytics?.quiz && (
            <p style={{ color: "#6c757d", margin: "0.5rem 0 0 0", fontSize: "1.1rem" }}>
              {analytics.quiz.title} • Quiz ID: {analytics.quiz.id}
            </p>
          )}
        </div>
        <button
          onClick={() => navigate("/teacher-dashboard")}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
            fontSize: "1rem"
          }}
        >
          ← Back to Dashboard
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

      {analytics?.quiz && (
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #dee2e6",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "2rem",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ color: "#343a40", margin: "0 0 1rem 0" }}>Quiz Information</h3>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem"
          }}>
            <div>
              <p style={{ margin: "0.25rem 0", color: "#6c757d" }}>
                <strong style={{ color: "#495057" }}>Category:</strong>
                <span style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  marginLeft: "0.5rem"
                }}>
                  {analytics.quiz.category}
                </span>
              </p>
            </div>
            <div>
              <p style={{ margin: "0.25rem 0", color: "#6c757d" }}>
                <strong style={{ color: "#495057" }}>Total Questions:</strong> {analytics.quiz.totalQuestions}
              </p>
            </div>
            <div>
              <p style={{ margin: "0.25rem 0", color: "#6c757d" }}>
                <strong style={{ color: "#495057" }}>Created:</strong> {analytics.quiz.createdDate}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1.5rem",
        marginBottom: "2rem"
      }}>
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #dee2e6",
          borderRadius: "12px",
          padding: "1.5rem",
          textAlign: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👥</div>
          <h3 style={{ color: "#007bff", margin: "0 0 0.5rem 0", fontSize: "2rem" }}>
            {stats.totalAttempts}
          </h3>
          <p style={{ color: "#6c757d", margin: 0, fontWeight: "500" }}>
            Total Attempts
          </p>
        </div>

        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #dee2e6",
          borderRadius: "12px",
          padding: "1.5rem",
          textAlign: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📊</div>
          <h3 style={{ 
            color: getScoreColor(stats.averageScore), 
            margin: "0 0 0.5rem 0", 
            fontSize: "2rem" 
          }}>
            {stats.averageScore}%
          </h3>
          <p style={{ color: "#6c757d", margin: 0, fontWeight: "500" }}>
            Average Score
          </p>
        </div>

        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #dee2e6",
          borderRadius: "12px",
          padding: "1.5rem",
          textAlign: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏆</div>
          <h3 style={{ 
            color: getScoreColor(stats.highestScore), 
            margin: "0 0 0.5rem 0", 
            fontSize: "2rem" 
          }}>
            {stats.highestScore}%
          </h3>
          <p style={{ color: "#6c757d", margin: 0, fontWeight: "500" }}>
            Highest Score
          </p>
        </div>

        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #dee2e6",
          borderRadius: "12px",
          padding: "1.5rem",
          textAlign: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
          <h3 style={{ 
            color: getScoreColor(stats.passRate), 
            margin: "0 0 0.5rem 0", 
            fontSize: "2rem" 
          }}>
            {stats.passRate}%
          </h3>
          <p style={{ color: "#6c757d", margin: 0, fontWeight: "500" }}>
            Pass Rate (≥60%)
          </p>
        </div>
      </div>

      <h2 style={{ color: "#343a40", marginBottom: "1.5rem" }}>Student Results</h2>

      {!analytics?.attempts || analytics.attempts.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "3rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "2px dashed #dee2e6"
        }}>
          <h3 style={{ color: "#6c757d", marginBottom: "1rem" }}>No Attempts Yet</h3>
          <p style={{ color: "#6c757d" }}>
            No students have taken this quiz yet. Share the Quiz ID ({quizId}) with your students.
          </p>
        </div>
      ) : (
        <div style={{ 
          backgroundColor: "#ffffff",
          border: "1px solid #dee2e6",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            backgroundColor: "#f8f9fa",
            padding: "1rem",
            borderBottom: "1px solid #dee2e6",
            fontWeight: "600",
            color: "#495057",
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
            gap: "1rem",
            alignItems: "center"
          }}>
            <div>Student</div>
            <div style={{ textAlign: "center" }}>Score</div>
            <div style={{ textAlign: "center" }}>Percentage</div>
            <div style={{ textAlign: "center" }}>Time Spent</div>
            <div style={{ textAlign: "center" }}>Completed</div>
          </div>

          {analytics.attempts
            .sort((a, b) => b.percentage - a.percentage)
            .map((attempt, index) => (
            <div
              key={attempt.id}
              style={{
                padding: "1rem",
                borderBottom: index < analytics.attempts.length - 1 ? "1px solid #e9ecef" : "none",
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                gap: "1rem",
                alignItems: "center",
                backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa"
              }}
            >
              <div>
                <div style={{ fontWeight: "600", color: "#343a40" }}>
                  {attempt.studentName}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#6c757d" }}>
                  ID: {attempt.studentId}
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <span style={{ fontWeight: "600", color: "#343a40" }}>
                  {attempt.score}/{attempt.totalQuestions}
                </span>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  gap: "0.5rem"
                }}>
                  <span style={{ fontSize: "1.2rem" }}>
                    {getGradeEmoji(attempt.percentage)}
                  </span>
                  <span style={{ 
                    fontWeight: "bold",
                    color: getScoreColor(attempt.percentage)
                  }}>
                    {attempt.percentage}%
                  </span>
                </div>
              </div>

              <div style={{ textAlign: "center", color: "#6c757d" }}>
                {attempt.timeSpent}
              </div>

              <div style={{ textAlign: "center", fontSize: "0.875rem", color: "#6c757d" }}>
                {new Date(attempt.completedAt).toLocaleDateString()}
                <br />
                {new Date(attempt.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizAnalytics;