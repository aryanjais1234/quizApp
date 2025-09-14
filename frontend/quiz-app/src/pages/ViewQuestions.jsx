import { useState, useEffect } from "react";
import { getAllQuestions } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ViewQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== "ROLE_TEACHER") {
      navigate("/login");
      return;
    }

    fetchAllQuestions();
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    filterQuestions();
  }, [questions, selectedCategory, selectedDifficulty]);

  const fetchAllQuestions = async () => {
    try {
      setLoading(true);
      const response = await getAllQuestions();
      setQuestions(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    if (selectedDifficulty !== "All") {
      filtered = filtered.filter(q => q.difficultylevel === selectedDifficulty);
    }

    setFilteredQuestions(filtered);
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(questions.map(q => q.category))];
    return ["All", ...categories];
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy": return "#28a745";
      case "medium": return "#ffc107";
      case "hard": return "#dc3545";
      default: return "#6c757d";
    }
  };

  if (!isAuthenticated() || user?.role !== "ROLE_TEACHER") {
    return null;
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Loading questions...</h2>
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
        <h1 style={{ color: "#343a40", margin: 0 }}>All Questions</h1>
        <button
          onClick={() => navigate("/add-question")}
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
          + Add New Question
        </button>
      </div>

      {/* Filters */}
      <div style={{ 
        display: "flex", 
        gap: "1rem", 
        marginBottom: "2rem",
        padding: "1rem",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label style={{ fontWeight: "500", color: "#495057" }}>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: "0.5rem",
              border: "1px solid #ced4da",
              borderRadius: "4px",
              backgroundColor: "white"
            }}
          >
            {getUniqueCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label style={{ fontWeight: "500", color: "#495057" }}>Difficulty:</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            style={{
              padding: "0.5rem",
              border: "1px solid #ced4da",
              borderRadius: "4px",
              backgroundColor: "white"
            }}
          >
            <option value="All">All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontWeight: "500", color: "#495057" }}>
            Showing {filteredQuestions.length} of {questions.length} questions
          </span>
        </div>
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

      {filteredQuestions.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "3rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "2px dashed #dee2e6"
        }}>
          <h3 style={{ color: "#6c757d", marginBottom: "1rem" }}>No Questions Found</h3>
          <p style={{ color: "#6c757d" }}>
            {questions.length === 0 
              ? "No questions have been created yet. Start by adding some questions."
              : "No questions match your current filters. Try adjusting the category or difficulty filters."
            }
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredQuestions.map((question, index) => (
            <div
              key={question.id}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-start",
                marginBottom: "1rem"
              }}>
                <h4 style={{ 
                  color: "#343a40", 
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  flex: 1
                }}>
                  {index + 1}. {question.questionTitle}
                </h4>
                <div style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem" }}>
                  <span style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "500"
                  }}>
                    {question.category}
                  </span>
                  <span style={{
                    backgroundColor: getDifficultyColor(question.difficultylevel),
                    color: "white",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "500"
                  }}>
                    {question.difficultylevel}
                  </span>
                </div>
              </div>

              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "0.5rem",
                marginBottom: "1rem"
              }}>
                {[question.option1, question.option2, question.option3, question.option4].map((option, optIndex) => (
                  <div
                    key={optIndex}
                    style={{
                      padding: "0.5rem 0.75rem",
                      backgroundColor: option === question.rightAnswer ? "#d4edda" : "#f8f9fa",
                      border: `1px solid ${option === question.rightAnswer ? "#c3e6cb" : "#e9ecef"}`,
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}
                  >
                    <span style={{ 
                      fontWeight: "600",
                      color: option === question.rightAnswer ? "#155724" : "#495057"
                    }}>
                      {String.fromCharCode(65 + optIndex)}.
                    </span>
                    <span style={{ 
                      color: option === question.rightAnswer ? "#155724" : "#495057"
                    }}>
                      {option}
                    </span>
                    {option === question.rightAnswer && (
                      <span style={{ 
                        marginLeft: "auto",
                        color: "#28a745",
                        fontWeight: "600"
                      }}>
                        ✓ Correct
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewQuestions;