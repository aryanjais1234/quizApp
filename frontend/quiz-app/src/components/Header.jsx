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
        background: "#282c34",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <Link
          to="/"
          style={{ marginRight: 15, color: "white", textDecoration: "none" }}
        >
          Home
        </Link>

        {isAuthenticated() && user?.role === "ROLE_TEACHER" && (
          <>
            <Link
              to="/create-quiz"
              style={{
                marginRight: 15,
                color: "white",
                textDecoration: "none",
              }}
            >
              Create Quiz
            </Link>
            <Link
              to="/add-question"
              style={{
                marginRight: 15,
                color: "white",
                textDecoration: "none",
              }}
            >
              Add Question
            </Link>
            <Link
              to="/questions"
              style={{
                marginRight: 15,
                color: "white",
                textDecoration: "none",
              }}
            >
              View All Questions
            </Link>
            <Link
              to="/quizzes"
              style={{
                marginRight: 15,
                color: "white",
                textDecoration: "none",
              }}
            >
              View Quiz
            </Link>
          </>
        )}

        {isAuthenticated() && user?.role === "ROLE_STUDENT" && (
          <>
            <Link
              to="/take-quiz"
              style={{
                marginRight: 15,
                color: "white",
                textDecoration: "none",
              }}
            >
              Take Quiz
            </Link>
            <Link
              to="/quizzes"
              style={{
                marginRight: 15,
                color: "white",
                textDecoration: "none",
              }}
            >
              View Quiz
            </Link>
          </>
        )}
      </div>

      <div>
        {isAuthenticated() ? (
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span>Welcome, {user?.username}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
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
                color: "white",
                textDecoration: "none",
              }}
            >
              Login
            </Link>
            <Link
              to="/register"
              style={{ color: "white", textDecoration: "none" }}
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
