import { useState, useEffect } from "react";
import { getQuizResultDetails } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";

const QuizResult = () => {
  const [resultDetails, setResultDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { quizId } = useParams();

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== "ROLE_STUDENT") {
      navigate("/login");
      return;
    }

    fetchQuizResultDetails();
  }, [isAuthenticated, user, navigate, quizId]);

  const fetchQuizResultDetails = async () => {
    try {
      setLoading(true);
      const response = await getQuizResultDetails(quizId);
      setResultDetails(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching quiz result details:", err);
      setError("Failed to load quiz result details. Please try again.");
      // For now, using mock data since backend endpoint doesn't exist yet
      setResultDetails({
        quiz: {
          id: quizId,
          title: "Java Basics Quiz",
          category: "Java",
          totalQuestions: 5,
          dateTaken: "2024-01-20",
          timeSpent: "8 minutes"
        },
        result: {
          score: 4,
          totalQuestions: 5,
          percentage: 80,
          passed: true
        },
        questions: [
          {
            id: 1,
            questionTitle: "What is the size of int in Java?",
            option1: "4 bytes",
            option2: "2 bytes", 
            option3: "8 bytes",
            option4: "1 byte",
            correctAnswer: "4 bytes",
            userAnswer: "4 bytes",
            isCorrect: true,
            difficultylevel: "Easy"
          },
          {
            id: 2,
            questionTitle: "Which keyword is used to inherit a class in Java?",
            option1: "class",
            option2: "interface",
            option3: "extends",
            option4: "implements",
            correctAnswer: "extends",
            userAnswer: "extends",
            isCorrect: true,
            difficultylevel: "Medium"
          },
          {
            id: 3,
            questionTitle: "Which method is the entry point in Java programs?",
            option1: "start()",
            option2: "run()",
            option3: "main()",
            option4: "init()",
            correctAnswer: "main()",
            userAnswer: "run()",
            isCorrect: false,
            difficultylevel: "Medium"
          },
          {
            id: 4,
            questionTitle: "What is used to handle exceptions in Java?",
            option1: "try-catch",
            option2: "final",
            option3: "throwable",
            option4: "error",
            correctAnswer: "try-catch",
            userAnswer: "try-catch",
            isCorrect: true,
            difficultylevel: "Medium"
          },
          {
            id: 5,
            questionTitle: "What is the base class of all Java classes?",
            option1: "Object",
            option2: "Class",
            option3: "System",
            option4: "Super",
            correctAnswer: "Object",
            userAnswer: "Object",
            isCorrect: true,
            difficultylevel: "Easy"
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy": return "#28a745";
      case "medium": return "#ffc107";
      case "hard": return "#dc3545";
      default: return "#6c757d";
    }
  };

  if (!isAuthenticated() || user?.role !== "ROLE_STUDENT") {
    return null;
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Loading quiz results...</h2>
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
        <div>
          <h1 style={{ color: "#343a40", margin: 0 }}>Quiz Result Details</h1>
          {resultDetails?.quiz && (
            <p style={{ color: "#6c757d", margin: "0.5rem 0 0 0", fontSize: "1.1rem" }}>
              {resultDetails.quiz.title} • Quiz ID: {resultDetails.quiz.id}
            </p>
          )}
        </div>
        <button
          onClick={() => navigate("/student-dashboard")}
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

      {resultDetails && (
        <>
          {/* Quiz Summary */}
          <div style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dee2e6",
            borderRadius: "12px",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem"
            }}>
              <h2 style={{ color: "#343a40", margin: 0 }}>Your Performance</h2>
              <div style={{ textAlign: "right" }}>
                <div style={{ 
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: getScoreColor(resultDetails.result.percentage),
                  marginBottom: "0.25rem"
                }}>
                  {getGradeEmoji(resultDetails.result.percentage)} {resultDetails.result.percentage}%
                </div>
                <div style={{ 
                  fontSize: "1rem",
                  color: "#6c757d"
                }}>
                  {resultDetails.result.score}/{resultDetails.result.totalQuestions} correct
                </div>
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem"
            }}>
              <div style={{
                backgroundColor: "#f8f9fa",
                padding: "1rem",
                borderRadius: "8px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📊</div>
                <div style={{ fontWeight: "bold", color: "#343a40", fontSize: "1.2rem" }}>
                  {resultDetails.result.percentage}%
                </div>
                <div style={{ color: "#6c757d", fontSize: "0.875rem" }}>Score</div>
              </div>

              <div style={{
                backgroundColor: "#f8f9fa",
                padding: "1rem",
                borderRadius: "8px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⏱️</div>
                <div style={{ fontWeight: "bold", color: "#343a40", fontSize: "1.2rem" }}>
                  {resultDetails.quiz.timeSpent}
                </div>
                <div style={{ color: "#6c757d", fontSize: "0.875rem" }}>Time Spent</div>
              </div>

              <div style={{
                backgroundColor: "#f8f9fa",
                padding: "1rem",
                borderRadius: "8px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📅</div>
                <div style={{ fontWeight: "bold", color: "#343a40", fontSize: "1.2rem" }}>
                  {resultDetails.quiz.dateTaken}
                </div>
                <div style={{ color: "#6c757d", fontSize: "0.875rem" }}>Date Taken</div>
              </div>

              <div style={{
                backgroundColor: "#f8f9fa",
                padding: "1rem",
                borderRadius: "8px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                  {resultDetails.result.passed ? "✅" : "❌"}
                </div>
                <div style={{ 
                  fontWeight: "bold", 
                  color: resultDetails.result.passed ? "#28a745" : "#dc3545",
                  fontSize: "1.2rem"
                }}>
                  {resultDetails.result.passed ? "PASSED" : "FAILED"}
                </div>
                <div style={{ color: "#6c757d", fontSize: "0.875rem" }}>Status</div>
              </div>
            </div>
          </div>

          {/* Question Details */}
          <h2 style={{ color: "#343a40", marginBottom: "1.5rem" }}>
            Question-by-Question Review
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {resultDetails.questions.map((question, index) => (
              <div
                key={question.id}
                style={{
                  backgroundColor: "#ffffff",
                  border: `2px solid ${question.isCorrect ? "#d4edda" : "#f8d7da"}`,
                  borderRadius: "12px",
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
                      backgroundColor: getDifficultyColor(question.difficultylevel),
                      color: "white",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "500"
                    }}>
                      {question.difficultylevel}
                    </span>
                    <span style={{
                      backgroundColor: question.isCorrect ? "#28a745" : "#dc3545",
                      color: "white",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "500"
                    }}>
                      {question.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                    </span>
                  </div>
                </div>

                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "0.75rem",
                  marginBottom: "1rem"
                }}>
                  {[question.option1, question.option2, question.option3, question.option4].map((option, optIndex) => {
                    const isCorrect = option === question.correctAnswer;
                    const isUserChoice = option === question.userAnswer;
                    
                    let backgroundColor = "#f8f9fa";
                    let borderColor = "#e9ecef";
                    let textColor = "#495057";
                    
                    if (isCorrect) {
                      backgroundColor = "#d4edda";
                      borderColor = "#c3e6cb";
                      textColor = "#155724";
                    } else if (isUserChoice && !isCorrect) {
                      backgroundColor = "#f8d7da";
                      borderColor = "#f5c6cb";
                      textColor = "#721c24";
                    }

                    return (
                      <div
                        key={optIndex}
                        style={{
                          padding: "0.75rem",
                          backgroundColor,
                          border: `1px solid ${borderColor}`,
                          borderRadius: "6px",
                          fontSize: "0.875rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          position: "relative"
                        }}
                      >
                        <span style={{ 
                          fontWeight: "600",
                          color: textColor
                        }}>
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        <span style={{ color: textColor, flex: 1 }}>
                          {option}
                        </span>
                        
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                          {isCorrect && (
                            <span style={{ 
                              color: "#28a745",
                              fontWeight: "600",
                              fontSize: "0.875rem"
                            }}>
                              ✓
                            </span>
                          )}
                          {isUserChoice && (
                            <span style={{ 
                              color: isCorrect ? "#28a745" : "#dc3545",
                              fontWeight: "600",
                              fontSize: "0.875rem"
                            }}>
                              👤
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{
                  backgroundColor: question.isCorrect ? "#d1ecf1" : "#f8d7da",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.875rem"
                }}>
                  <div style={{ 
                    color: question.isCorrect ? "#0c5460" : "#721c24",
                    fontWeight: "500"
                  }}>
                    {question.isCorrect ? (
                      <>✓ Correct! You selected the right answer.</>
                    ) : (
                      <>
                        ✗ Incorrect. You selected "{question.userAnswer}" but the correct answer is "{question.correctAnswer}".
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Summary */}
          <div style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dee2e6",
            borderRadius: "12px",
            padding: "2rem",
            marginTop: "2rem",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ color: "#343a40", marginBottom: "1rem" }}>
              Performance Summary
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem"
            }}>
              <div>
                <div style={{ fontSize: "1.5rem", color: "#28a745", fontWeight: "bold" }}>
                  {resultDetails.questions.filter(q => q.isCorrect).length}
                </div>
                <div style={{ color: "#6c757d", fontSize: "0.875rem" }}>Correct Answers</div>
              </div>
              <div>
                <div style={{ fontSize: "1.5rem", color: "#dc3545", fontWeight: "bold" }}>
                  {resultDetails.questions.filter(q => !q.isCorrect).length}
                </div>
                <div style={{ color: "#6c757d", fontSize: "0.875rem" }}>Incorrect Answers</div>
              </div>
              <div>
                <div style={{ fontSize: "1.5rem", color: "#007bff", fontWeight: "bold" }}>
                  {resultDetails.result.percentage}%
                </div>
                <div style={{ color: "#6c757d", fontSize: "0.875rem" }}>Overall Score</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuizResult;