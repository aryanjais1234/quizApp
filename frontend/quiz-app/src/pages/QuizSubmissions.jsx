import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getQuizSubmissions } from "../api/api";
import { useAuth } from "../context/AuthContext";

// Helper to compute stats per student
const computeUserStats = (submissions) => {
  if (!submissions || submissions.length === 0) {
    return { attempts: 0, best: 0, avg: 0, lastAttemptAt: null };
  }

  const attempts = submissions.length;
  const scores = submissions.map((s) => {
    const pct =
      s.totalQuestions > 0 ? Math.round((s.score / s.totalQuestions) * 100) : 0;
    return { pct, raw: s.score, total: s.totalQuestions };
  });

  const best = Math.max(...scores.map((s) => s.pct));
  const avg = Math.round(scores.reduce((a, b) => a + b.pct, 0) / scores.length);

  const last = submissions
    .slice()
    .sort((a, b) => new Date(b.dateTaken) - new Date(a.dateTaken))[0];

  return { attempts, best, avg, lastAttemptAt: last?.dateTaken };
};

const QuizSubmissions = () => {
  const { quizId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== "ROLE_TEACHER") {
      navigate("/login");
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        const res = await getQuizSubmissions(quizId);
        setData(Array.isArray(res.data) ? res.data : []);
        setError("");
      } catch (err) {
        console.error("Failed to load submissions", err);
        setError(
          err?.response?.data?.message ||
            "Failed to load submissions. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quizId, isAuthenticated, user, navigate]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const s of data) {
      const key = s.username;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    }

    const rows = [];
    for (const [username, submissions] of map.entries()) {
      const stats = computeUserStats(submissions);
      rows.push({ username, submissions, ...stats });
    }
    rows.sort((a, b) => b.best - a.best);
    return rows;
  }, [data]);

  const openStudent = (username) => {
    const userSubs = data.filter((d) => d.username === username);
    if (userSubs.length === 0) return;
    const latest = userSubs.sort(
      (a, b) => new Date(b.dateTaken) - new Date(a.dateTaken)
    )[0];
    navigate(`/student-response/${latest.submissionId}`, {
      state: { submission: latest },
    });
  };

  const openSubmission = (submission) => {
    navigate(`/student-response/${submission.submissionId}`, {
      state: { submission },
    });
  };

  if (!isAuthenticated() || user?.role !== "ROLE_TEACHER") return null;

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Loading submissions...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <h1 style={{ margin: 0, color: "#343a40" }}>Quiz Submissions</h1>
        <button
          onClick={() => navigate(`/quiz-analytics/${quizId}`)}
          style={{
            padding: "0.5rem 1rem",
            background: "#6c757d",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          ← Back to Analytics
        </button>
      </div>

      {/* Error */}
      {error && (
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
      )}

      {/* Users Summary */}
      <h2 style={{ color: "#343a40", marginBottom: "1rem" }}>Students</h2>
      {grouped.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            backgroundColor: "#f8f9fa",
            borderRadius: 8,
            border: "2px dashed #dee2e6",
          }}
        >
          <h3 style={{ color: "#6c757d", marginBottom: "1rem" }}>
            No submissions yet
          </h3>
          <p style={{ color: "#6c757d" }}>
            Share the quiz ID with students to start collecting attempts.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            border: "1px solid #dee2e6",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              background: "#f8f9fa",
              padding: "0.75rem 1rem",
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
              gap: "1rem",
              borderBottom: "1px solid #dee2e6",
              fontWeight: 600,
              color: "#495057",
            }}
          >
            <div>Username</div>
            <div style={{ textAlign: "center" }}>Attempts</div>
            <div style={{ textAlign: "center" }}>Best</div>
            <div style={{ textAlign: "center" }}>Avg</div>
            <div style={{ textAlign: "center" }}>Last Attempt</div>
          </div>
          {grouped.map((row, idx) => (
            <div
              key={row.username}
              style={{
                padding: "0.75rem 1rem",
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                gap: "1rem",
                background: idx % 2 === 0 ? "#fff" : "#f8f9fa",
                borderBottom:
                  idx < grouped.length - 1 ? "1px solid #e9ecef" : "none",
                cursor: "pointer",
              }}
              onClick={() => openStudent(row.username)}
            >
              <div style={{ fontWeight: 600, color: "#343a40" }}>
                {row.username}
              </div>
              <div style={{ textAlign: "center" }}>{row.attempts}</div>
              <div style={{ textAlign: "center", color: "#28a745" }}>
                {row.best}%
              </div>
              <div style={{ textAlign: "center", color: "#17a2b8" }}>
                {row.avg}%
              </div>
              <div style={{ textAlign: "center", color: "#6c757d" }}>
                {row.lastAttemptAt
                  ? new Date(row.lastAttemptAt).toLocaleString()
                  : "-"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Raw submissions */}
      <h2 style={{ color: "#343a40", marginBottom: "1rem" }}>All Attempts</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1rem",
        }}
      >
        {data
          .slice()
          .sort((a, b) => new Date(b.dateTaken) - new Date(a.dateTaken))
          .map((sub) => {
            const percentage =
              sub.totalQuestions > 0
                ? Math.round((sub.score / sub.totalQuestions) * 100)
                : 0;
            return (
              <div
                key={sub.submissionId}
                style={{
                  background: "#fff",
                  border: "1px solid #dee2e6",
                  borderRadius: 12,
                  padding: "1rem",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                }}
                onClick={() => openSubmission(sub)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div style={{ fontWeight: 600, color: "#343a40" }}>
                    {sub.username}
                  </div>
                  <span
                    style={{
                      background: "#e9ecef",
                      color: "#495057",
                      padding: "0.25rem 0.5rem",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  >
                    SID: {sub.submissionId}
                  </span>
                </div>
                <div style={{ color: "#6c757d", marginBottom: 8 }}>
                  Quiz #{sub.quizId} •{" "}
                  {new Date(sub.dateTaken).toLocaleString()}
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>
                      {percentage}%
                    </div>
                    <div style={{ fontSize: 12, color: "#6c757d" }}>
                      {sub.score}/{sub.totalQuestions}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", color: "#6c757d" }}>
                    Time:{" "}
                    {sub.timeSpent && sub.timeSpent !== "N/A"
                      ? sub.timeSpent
                      : "-"}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default QuizSubmissions;
