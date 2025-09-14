import { useState } from "react";
import { createQuiz } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CreateQuiz = () => {
  const [formData, setFormData] = useState({
    categoryName: "",
    numQuestions: 1,
    title: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numQuestions" ? parseInt(value) : value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      setMessage("Please login to create a quiz.");
      return;
    }
    if (user?.role === "STUDENT") {
      setMessage("Students are not allowed to create quizzes.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await createQuiz(formData);
      setMessage(`✅ Quiz created successfully! Quiz ID: ${response.data}`);
      setFormData({
        categoryName: "",
        numQuestions: 1,
        title: "",
      });
    } catch (error) {
      console.error("Create quiz error:", error);
      // Check for forbidden or custom backend error
      if (
        error.response?.status === 500 ||
        (typeof error.response?.data === "string" &&
          error.response.data.toLowerCase().includes("student"))
      ) {
        setMessage(
          "❌ Students are not allowed to create quizzes."
        );
      } else {
        setMessage(
          `❌ Failed to create quiz: ${error.response?.data || error.message}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Create a Quiz</h2>
        <p>
          Please <a href="/login">login</a> to create a quiz.
        </p>
      </div>
    );
  }
  if (user?.role === "STUDENT") {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
        <h2>Access Denied</h2>
        <p>Students are not allowed to create quizzes.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "2rem", 
      maxWidth: "600px", 
      margin: "0 auto",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        border: "1px solid #dee2e6",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ 
          color: "#343a40", 
          marginBottom: "2rem",
          textAlign: "center",
          fontSize: "1.75rem"
        }}>
          Quick Quiz Creator
        </h2>
        <p style={{ 
          color: "#6c757d", 
          textAlign: "center",
          marginBottom: "2rem"
        }}>
          Create a quiz with random questions from your selected category
        </p>
        
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ 
              display: "block",
              fontWeight: "500",
              color: "#495057",
              marginBottom: "0.5rem"
            }}>
              Quiz Title:
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter quiz title"
              required
              style={{ 
                width: "100%", 
                padding: "0.75rem", 
                border: "1px solid #ced4da",
                borderRadius: "8px",
                fontSize: "1rem",
                transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#007bff";
                e.target.style.boxShadow = "0 0 0 0.2rem rgba(0, 123, 255, 0.25)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#ced4da";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ 
              display: "block",
              fontWeight: "500",
              color: "#495057",
              marginBottom: "0.5rem"
            }}>
              Category:
            </label>
            <select
              name="categoryName"
              value={formData.categoryName}
              onChange={handleChange}
              required
              style={{ 
                width: "100%", 
                padding: "0.75rem", 
                border: "1px solid #ced4da",
                borderRadius: "8px",
                fontSize: "1rem",
                backgroundColor: "#ffffff",
                transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#007bff";
                e.target.style.boxShadow = "0 0 0 0.2rem rgba(0, 123, 255, 0.25)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#ced4da";
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="">Select a category</option>
              <option value="Java">☕ Java</option>
              <option value="Python">🐍 Python</option>
              <option value="JavaScript">🟨 JavaScript</option>
            </select>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{ 
              display: "block",
              fontWeight: "500",
              color: "#495057",
              marginBottom: "0.5rem"
            }}>
              Number of Questions:
            </label>
            <input
              type="number"
              name="numQuestions"
              value={formData.numQuestions}
              onChange={handleChange}
              min="1"
              max="20"
              required
              style={{ 
                width: "100%", 
                padding: "0.75rem", 
                border: "1px solid #ced4da",
                borderRadius: "8px",
                fontSize: "1rem",
                transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#007bff";
                e.target.style.boxShadow = "0 0 0 0.2rem rgba(0, 123, 255, 0.25)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#ced4da";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: loading ? "#6c757d" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1.1rem",
              fontWeight: "600",
              transition: "background-color 0.3s ease"
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#0056b3";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#007bff";
              }
            }}
          >
            {loading ? "Creating Quiz..." : "🚀 Create Quiz"}
          </button>
        </form>

        {message && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              backgroundColor: message.includes("✅") ? "#d4edda" : "#f8d7da",
              color: message.includes("✅") ? "#155724" : "#721c24",
              border: `1px solid ${message.includes("✅") ? "#c3e6cb" : "#f5c6cb"}`,
              borderRadius: "8px",
              textAlign: "center",
              fontWeight: "500"
            }}
          >
            {message}
          </div>
        )}

        <div style={{ 
          marginTop: "2rem", 
          textAlign: "center",
          padding: "1rem",
          backgroundColor: "#e7f3ff",
          borderRadius: "8px",
          border: "1px solid #bee5eb"
        }}>
          <p style={{ 
            color: "#0c5460", 
            margin: "0 0 0.5rem 0",
            fontWeight: "500"
          }}>
            💡 Want more control?
          </p>
          <button
            onClick={() => navigate("/advanced-quiz-creator")}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "0.9rem"
            }}
          >
            Try Advanced Quiz Creator
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
