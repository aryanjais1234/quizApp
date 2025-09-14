import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav
      style={{
        padding: "1rem",
        background: "#ffffff",
        color: "#213547",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        borderBottom: "1px solid #e9ecef",
      }}
    >
      <div>
        <Link
          to="/"
          style={{ marginRight: 15, color: "#007bff", textDecoration: "none", fontWeight: "500" }}
        >
          Home
        </Link>

        {isAuthenticated() && user?.role === "ROLE_TEACHER" && (
          <>
            <Link
              to="/create-quiz"
              style={{
                marginRight: 15,
                color: "#007bff",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Quick Quiz
            </Link>
            <Link
              to="/advanced-quiz-creator"
              style={{
                marginRight: 15,
                color: "#007bff",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Custom Quiz
            </Link>
            <Link
              to="/add-question"
              style={{
                marginRight: 15,
                color: "#007bff",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Add Question
            </Link>
            <Link
              to="/view-questions"
              style={{
                marginRight: 15,
                color: "#007bff",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              View Questions
            </Link>
            <Link
              to="/teacher-dashboard"
              style={{
                marginRight: 15,
                color: "#007bff",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              My Quizzes
            </Link>
          </>
        )}

        {isAuthenticated() && user?.role === "ROLE_STUDENT" && (
          <>
            <Link
              to="/take-quiz"
              style={{
                marginRight: 15,
                color: "#007bff",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Take Quiz
            </Link>
            <Link
              to="/student-dashboard"
              style={{
                marginRight: 15,
                color: "#007bff",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              My Dashboard
            </Link>
          </>
        )}
      </div>

      <div>
        {isAuthenticated() ? (
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ color: "#495057", fontWeight: "500" }}>Welcome, {user?.username}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <Link
              to="/login"
              style={{
                marginRight: 15,
                color: "#007bff",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Login
            </Link>
            <Link
              to="/register"
              style={{ color: "#007bff", textDecoration: "none", fontWeight: "500" }}
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
