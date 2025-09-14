import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getSubmissionById } from "../api/api";
import { useAuth } from "../context/AuthContext";

const StudentResponse = () => {
  const { submissionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [submission, setSubmission] = useState(
    location.state?.submission || null
  );
  const [loading, setLoading] = useState(!location.state?.submission);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== "ROLE_TEACHER") {
      navigate("/login");
      return;
    }
    if (!submission) {
      const load = async () => {
        try {
          setLoading(true);
          const res = await getSubmissionById(submissionId);
          setSubmission(res.data);
          setError("");
        } catch (err) {
          console.error("Failed to load submission", err);
          setError(
            err?.response?.data?.message ||
              "Failed to load submission. Please try again."
          );
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [submissionId, submission, isAuthenticated, user, navigate]);

  if (!isAuthenticated() || user?.role !== "ROLE_TEACHER") return null;

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Loading response...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb",
            borderRadius: 4,
            marginBottom: "1.5rem",
          }}
        >
          {error}
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "0.5rem 1rem",
            background: "#6c757d",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      </div>
    );
  }

  if (!submission) return null;

  const percentage =
    submission.percentage ??
    Math.round((submission.score / submission.totalQuestions) * 100);

  return (
    <div style={{ padding: "2rem", maxWidth: 1000, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ margin: 0, color: "#343a40" }}>Student Response</h1>
          <div style={{ color: "#6c757d", marginTop: 6 }}>
            <strong>User:</strong> {submission.username} • <strong>SID:</strong>{" "}
            {submission.submissionId} • <strong>Quiz:</strong>{" "}
            {submission.quizId}
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "0.5rem 1rem",
            background: "#6c757d",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #dee2e6",
          borderRadius: 12,
          padding: "1rem",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{percentage}%</div>
            <div style={{ fontSize: 12, color: "#6c757d" }}>
              {submission.score}/{submission.totalQuestions} correct
            </div>
          </div>
          <div style={{ textAlign: "right", color: "#6c757d" }}>
            Taken at: {new Date(submission.dateTaken).toLocaleString()}
            <br />
            Time: {submission.timeSpent || "-"}
          </div>
        </div>
      </div>

      <h2 style={{ color: "#343a40", marginBottom: "0.75rem" }}>Responses</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {submission.responses?.map((r, idx) => (
          <div
            key={`${submission.submissionId}-${r.questionId}-${idx}`}
            style={{
              background: "#fff",
              border: "1px solid #dee2e6",
              borderRadius: 8,
              padding: "0.75rem 1rem",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 600 }}>
                Q{idx + 1}. {r.questionTitle}
              </div>
              <div
                style={{
                  color: r.isCorrect ? "#28a745" : "#dc3545",
                  fontWeight: 700,
                }}
              >
                {r.isCorrect ? "Correct" : "Wrong"}
              </div>
            </div>
            <div style={{ marginTop: 6, color: "#6c757d" }}>
              <div>
                Student Answer: <strong>{r.studentResponse}</strong>
              </div>
              <div>
                Right Answer: <strong>{r.rightAnswer}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentResponse;
