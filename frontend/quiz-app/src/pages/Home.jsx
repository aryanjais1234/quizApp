import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ 
      padding: "2rem", 
      maxWidth: "1200px", 
      margin: "0 auto",
      textAlign: "center"
    }}>
      <div style={{ 
        marginBottom: "3rem",
        padding: "3rem 2rem",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "16px",
        color: "white"
      }}>
        <h1 style={{ 
          fontSize: "3rem", 
          margin: "0 0 1rem 0",
          fontWeight: "700"
        }}>
          🎓 Quiz Platform
        </h1>
        <p style={{ 
          fontSize: "1.25rem", 
          margin: "0 0 2rem 0",
          opacity: "0.9"
        }}>
          Create engaging quizzes, track progress, and enhance learning experiences
        </p>
        
        {!isAuthenticated() && (
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "white",
                color: "#667eea",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "1.1rem"
              }}
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/register")}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "transparent",
                color: "white",
                border: "2px solid white",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "1.1rem"
              }}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>

      {isAuthenticated() && (
        <div>
          <h2 style={{ 
            color: "#343a40", 
            marginBottom: "2rem",
            fontSize: "2rem"
          }}>
            Welcome back, {user?.username}! 👋
          </h2>

          {user?.role === "ROLE_TEACHER" ? (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
              marginBottom: "3rem"
            }}>
              <div
                onClick={() => navigate("/teacher-dashboard")}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #dee2e6",
                  borderRadius: "12px",
                  padding: "2rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
                <h3 style={{ color: "#343a40", margin: "0 0 0.5rem 0" }}>My Quizzes</h3>
                <p style={{ color: "#6c757d", margin: 0 }}>
                  View and manage all your created quizzes
                </p>
              </div>

              <div
                onClick={() => navigate("/create-quiz")}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #dee2e6",
                  borderRadius: "12px",
                  padding: "2rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>➕</div>
                <h3 style={{ color: "#343a40", margin: "0 0 0.5rem 0" }}>Quick Create</h3>
                <p style={{ color: "#6c757d", margin: 0 }}>
                  Create a quiz with random questions
                </p>
              </div>

              <div
                onClick={() => navigate("/advanced-quiz-creator")}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #dee2e6",
                  borderRadius: "12px",
                  padding: "2rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎯</div>
                <h3 style={{ color: "#343a40", margin: "0 0 0.5rem 0" }}>Custom Quiz</h3>
                <p style={{ color: "#6c757d", margin: 0 }}>
                  Choose specific questions for your quiz
                </p>
              </div>

              <div
                onClick={() => navigate("/view-questions")}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #dee2e6",
                  borderRadius: "12px",
                  padding: "2rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
                <h3 style={{ color: "#343a40", margin: "0 0 0.5rem 0" }}>Question Bank</h3>
                <p style={{ color: "#6c757d", margin: 0 }}>
                  Browse and manage all questions
                </p>
              </div>

              <div
                onClick={() => navigate("/add-question")}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #dee2e6",
                  borderRadius: "12px",
                  padding: "2rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✏️</div>
                <h3 style={{ color: "#343a40", margin: "0 0 0.5rem 0" }}>Add Question</h3>
                <p style={{ color: "#6c757d", margin: 0 }}>
                  Create new questions for quizzes
                </p>
              </div>
            </div>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
              marginBottom: "3rem"
            }}>
              <div
                onClick={() => navigate("/student-dashboard")}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #dee2e6",
                  borderRadius: "12px",
                  padding: "2rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
                <h3 style={{ color: "#343a40", margin: "0 0 0.5rem 0" }}>My Dashboard</h3>
                <p style={{ color: "#6c757d", margin: 0 }}>
                  View your quiz history and progress
                </p>
              </div>

              <div
                onClick={() => navigate("/take-quiz")}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #dee2e6",
                  borderRadius: "12px",
                  padding: "2rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎯</div>
                <h3 style={{ color: "#343a40", margin: "0 0 0.5rem 0" }}>Take Quiz</h3>
                <p style={{ color: "#6c757d", margin: 0 }}>
                  Start a new quiz challenge
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {!isAuthenticated() && (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "2rem",
          marginTop: "3rem"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dee2e6",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👨‍🏫</div>
            <h3 style={{ color: "#343a40", margin: "0 0 0.5rem 0" }}>For Teachers</h3>
            <p style={{ color: "#6c757d", margin: 0 }}>
              Create quizzes, manage questions, and track student progress
            </p>
          </div>

          <div style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dee2e6",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👨‍🎓</div>
            <h3 style={{ color: "#343a40", margin: "0 0 0.5rem 0" }}>For Students</h3>
            <p style={{ color: "#6c757d", margin: 0 }}>
              Take quizzes, track your progress, and improve your skills
            </p>
          </div>

          <div style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dee2e6",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📈</div>
            <h3 style={{ color: "#343a40", margin: "0 0 0.5rem 0" }}>Track Progress</h3>
            <p style={{ color: "#6c757d", margin: 0 }}>
              Monitor performance and identify areas for improvement
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
export default Home;
