import { useState, useEffect } from "react";
import { getQuestionsByCategory, createQuiz } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdvancedQuizCreator = () => {
  const [step, setStep] = useState(1); // 1: Category Selection, 2: Question Selection, 3: Quiz Details
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [quizDetails, setQuizDetails] = useState({
    title: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== "ROLE_TEACHER") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  const categories = ["Java", "Python", "JavaScript"];

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    setError("");
    
    try {
      const response = await getQuestionsByCategory(category);
      setAvailableQuestions(response.data);
      setStep(2);
    } catch (err) {
      console.error("Error fetching questions by category:", err);
      setError("Failed to load questions for this category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionToggle = (question) => {
    setSelectedQuestions(prev => {
      const isSelected = prev.find(q => q.id === question.id);
      if (isSelected) {
        return prev.filter(q => q.id !== question.id);
      } else {
        return [...prev, question];
      }
    });
  };

  const handleCreateQuiz = async () => {
    if (!quizDetails.title.trim()) {
      setError("Please enter a quiz title.");
      return;
    }

    if (selectedQuestions.length === 0) {
      setError("Please select at least one question.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // For now, using the existing createQuiz endpoint
      // In a real implementation, you'd need a new endpoint that accepts specific question IDs
      const quizData = {
        categoryName: selectedCategory,
        numQuestions: selectedQuestions.length,
        title: quizDetails.title,
        questionIds: selectedQuestions.map(q => q.id)
      };

      const response = await createQuiz(quizData);
      setMessage(`✅ Quiz created successfully! Quiz ID: ${response.data}`);
      
      // Reset form
      setStep(1);
      setSelectedCategory("");
      setAvailableQuestions([]);
      setSelectedQuestions([]);
      setQuizDetails({ title: "", description: "" });
    } catch (err) {
      console.error("Create quiz error:", err);
      setError("Failed to create quiz. Please try again.");
    } finally {
      setLoading(false);
    }
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

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ 
        marginBottom: "2rem",
        borderBottom: "2px solid #e9ecef",
        paddingBottom: "1rem"
      }}>
        <h1 style={{ color: "#343a40", margin: 0 }}>Advanced Quiz Creator</h1>
        <p style={{ color: "#6c757d", margin: "0.5rem 0 0 0" }}>
          Create custom quizzes by selecting specific questions from your question bank
        </p>
      </div>

      {/* Progress Indicator */}
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        marginBottom: "2rem" 
      }}>
        {[1, 2, 3].map(stepNum => (
          <div key={stepNum} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: step >= stepNum ? "#007bff" : "#e9ecef",
              color: step >= stepNum ? "white" : "#6c757d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold"
            }}>
              {stepNum}
            </div>
            <span style={{ 
              margin: "0 1rem",
              color: step >= stepNum ? "#007bff" : "#6c757d",
              fontWeight: step >= stepNum ? "600" : "normal"
            }}>
              {stepNum === 1 ? "Category" : stepNum === 2 ? "Questions" : "Details"}
            </span>
            {stepNum < 3 && (
              <div style={{ 
                width: "60px", 
                height: "2px", 
                backgroundColor: step > stepNum ? "#007bff" : "#e9ecef",
                margin: "0 1rem"
              }} />
            )}
          </div>
        ))}
      </div>

      {message && (
        <div style={{
          padding: "1rem",
          backgroundColor: "#d4edda",
          color: "#155724",
          border: "1px solid #c3e6cb",
          borderRadius: "4px",
          marginBottom: "1.5rem"
        }}>
          {message}
        </div>
      )}

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

      {/* Step 1: Category Selection */}
      {step === 1 && (
        <div>
          <h2 style={{ color: "#343a40", marginBottom: "1.5rem" }}>
            Step 1: Choose a Category
          </h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem"
          }}>
            {categories.map(category => (
              <div
                key={category}
                onClick={() => handleCategorySelect(category)}
                style={{
                  backgroundColor: "#ffffff",
                  border: "2px solid #dee2e6",
                  borderRadius: "12px",
                  padding: "2rem",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#007bff";
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#dee2e6";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                  {category === "Java" ? "☕" : category === "Python" ? "🐍" : "🟨"}
                </div>
                <h3 style={{ color: "#343a40", margin: "0 0 0.5rem 0" }}>
                  {category}
                </h3>
                <p style={{ color: "#6c757d", margin: 0 }}>
                  Select questions from {category} category
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Question Selection */}
      {step === 2 && (
        <div>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "1.5rem"
          }}>
            <h2 style={{ color: "#343a40", margin: 0 }}>
              Step 2: Select Questions ({selectedCategory})
            </h2>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <span style={{ color: "#6c757d", fontWeight: "500" }}>
                Selected: {selectedQuestions.length} questions
              </span>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedQuestions.length === 0}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: selectedQuestions.length > 0 ? "#007bff" : "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: selectedQuestions.length > 0 ? "pointer" : "not-allowed",
                  fontWeight: "500"
                }}
              >
                Next →
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <p>Loading questions...</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {availableQuestions.map((question, index) => {
                const isSelected = selectedQuestions.find(q => q.id === question.id);
                return (
                  <div
                    key={question.id}
                    style={{
                      backgroundColor: isSelected ? "#e7f3ff" : "#ffffff",
                      border: `2px solid ${isSelected ? "#007bff" : "#dee2e6"}`,
                      borderRadius: "8px",
                      padding: "1.5rem",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                    onClick={() => handleQuestionToggle(question)}
                  >
                    <div style={{ 
                      display: "flex", 
                      alignItems: "flex-start", 
                      gap: "1rem"
                    }}>
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleQuestionToggle(question);
                        }}
                        style={{
                          width: "20px",
                          height: "20px",
                          marginTop: "0.25rem",
                          cursor: "pointer"
                        }}
                      />
                      <div style={{ flex: 1 }}>
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
                            fontWeight: "600"
                          }}>
                            {index + 1}. {question.questionTitle}
                          </h4>
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

                        <div style={{ 
                          display: "grid", 
                          gridTemplateColumns: "1fr 1fr", 
                          gap: "0.5rem"
                        }}>
                          {[question.option1, question.option2, question.option3, question.option4].map((option, optIndex) => (
                            <div
                              key={optIndex}
                              style={{
                                padding: "0.5rem 0.75rem",
                                backgroundColor: option === question.rightAnswer ? "#d4edda" : "#f8f9fa",
                                border: `1px solid ${option === question.rightAnswer ? "#c3e6cb" : "#e9ecef"}`,
                                borderRadius: "4px",
                                fontSize: "0.875rem"
                              }}
                            >
                              <span style={{ fontWeight: "600", marginRight: "0.5rem" }}>
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              {option}
                              {option === question.rightAnswer && (
                                <span style={{ 
                                  marginLeft: "0.5rem",
                                  color: "#28a745",
                                  fontWeight: "600"
                                }}>
                                  ✓
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Quiz Details */}
      {step === 3 && (
        <div>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "1.5rem"
          }}>
            <h2 style={{ color: "#343a40", margin: 0 }}>
              Step 3: Quiz Details
            </h2>
            <button
              onClick={() => setStep(2)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              ← Back to Questions
            </button>
          </div>

          <div style={{ 
            backgroundColor: "#ffffff",
            border: "1px solid #dee2e6",
            borderRadius: "8px",
            padding: "2rem",
            maxWidth: "600px"
          }}>
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
                value={quizDetails.title}
                onChange={(e) => setQuizDetails(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter quiz title"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "1rem"
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
                Description (Optional):
              </label>
              <textarea
                value={quizDetails.description}
                onChange={(e) => setQuizDetails(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter quiz description"
                rows="3"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  resize: "vertical"
                }}
              />
            </div>

            <div style={{ 
              backgroundColor: "#f8f9fa",
              padding: "1rem",
              borderRadius: "4px",
              marginBottom: "1.5rem"
            }}>
              <h4 style={{ color: "#343a40", margin: "0 0 0.5rem 0" }}>Quiz Summary:</h4>
              <p style={{ margin: "0.25rem 0", color: "#6c757d" }}>
                <strong>Category:</strong> {selectedCategory}
              </p>
              <p style={{ margin: "0.25rem 0", color: "#6c757d" }}>
                <strong>Number of Questions:</strong> {selectedQuestions.length}
              </p>
              <p style={{ margin: "0.25rem 0", color: "#6c757d" }}>
                <strong>Difficulty Distribution:</strong>
              </p>
              <div style={{ marginLeft: "1rem" }}>
                {["Easy", "Medium", "Hard"].map(difficulty => {
                  const count = selectedQuestions.filter(q => q.difficultylevel === difficulty).length;
                  if (count > 0) {
                    return (
                      <span
                        key={difficulty}
                        style={{
                          display: "inline-block",
                          margin: "0.25rem 0.5rem 0.25rem 0",
                          padding: "0.25rem 0.5rem",
                          backgroundColor: getDifficultyColor(difficulty),
                          color: "white",
                          borderRadius: "4px",
                          fontSize: "0.875rem"
                        }}
                      >
                        {difficulty}: {count}
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            <button
              onClick={handleCreateQuiz}
              disabled={loading || !quizDetails.title.trim()}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: !quizDetails.title.trim() ? "#6c757d" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: !quizDetails.title.trim() ? "not-allowed" : "pointer",
                fontWeight: "500",
                fontSize: "1rem"
              }}
            >
              {loading ? "Creating Quiz..." : "Create Quiz"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedQuizCreator;