import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getMyMaterials,
  generateQuizAI,
  saveQuizAI,
} from "../api/api";

// ─── Styles (inline — consistent with existing pages) ───────────────────────

const styles = {
  container: { padding: "2rem", maxWidth: "1100px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    borderBottom: "2px solid #e9ecef",
    paddingBottom: "1rem",
  },
  card: {
    backgroundColor: "#fff",
    border: "1px solid #dee2e6",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
  },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#343a40",
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    fontWeight: "500",
    color: "#495057",
    marginBottom: "0.4rem",
    fontSize: "0.9rem",
  },
  input: {
    width: "100%",
    padding: "0.6rem 0.8rem",
    border: "1px solid #ced4da",
    borderRadius: "6px",
    fontSize: "0.95rem",
    marginBottom: "1rem",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "0.6rem 0.8rem",
    border: "1px solid #ced4da",
    borderRadius: "6px",
    fontSize: "0.95rem",
    marginBottom: "1rem",
    boxSizing: "border-box",
    backgroundColor: "#fff",
  },
  btn: {
    padding: "0.65rem 1.4rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
    transition: "opacity 0.2s",
  },
  alert: (type) => ({
    padding: "0.9rem 1rem",
    borderRadius: "6px",
    marginBottom: "1.2rem",
    backgroundColor: type === "error" ? "#f8d7da" : "#d4edda",
    color: type === "error" ? "#721c24" : "#155724",
    border: `1px solid ${type === "error" ? "#f5c6cb" : "#c3e6cb"}`,
  }),
};

// ─── Component ────────────────────────────────────────────────────────────────

const AIQuizGenerator = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Materials
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState([]);

  // Quiz params
  const [quizTitle, setQuizTitle] = useState("");
  const [category, setCategory] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");

  // State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Generated quiz
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated() || user?.role !== "ROLE_TEACHER") {
      navigate("/login");
    } else {
      fetchMaterials();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMaterials = async () => {
    try {
      const res = await getMyMaterials();
      setMaterials(res.data || []);
    } catch (err) {
      console.error("Failed to load materials:", err);
    }
  };

  // ── Material selection ──────────────────────────────────────────────────────
  const toggleMaterial = (id) => {
    setSelectedMaterialIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  // ── Generate ────────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setError("");
    setSuccess("");

    if (selectedMaterialIds.length === 0) {
      setError("Please select at least one study material.");
      return;
    }
    if (!quizTitle.trim()) {
      setError("Please enter a quiz title.");
      return;
    }
    if (!category.trim()) {
      setError("Please enter a category.");
      return;
    }

    setLoading(true);
    try {
      const res = await generateQuizAI({
        material_ids: selectedMaterialIds,
        num_questions: numQuestions,
        difficulty,
        quiz_title: quizTitle,
        category,
        session_id: sessionId,
      });

      const data = res.data;
      setGeneratedQuestions(data.questions);
      setSessionId(data.session_id);
      setShowPreview(true);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Failed to generate quiz. Make sure the AI service is running and materials have transcripts.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await saveQuizAI({
        questions: generatedQuestions,
        quiz_title: quizTitle,
        category,
        num_questions: generatedQuestions.length,
      });
      setSuccess("Quiz saved successfully! Redirecting to dashboard…");
      setTimeout(() => navigate("/teacher-dashboard"), 2000);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Failed to save quiz. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Discard ─────────────────────────────────────────────────────────────────
  const handleDiscard = () => {
    setGeneratedQuestions([]);
    setShowPreview(false);
    setSuccess("");
    setError("");
  };

  // ── Question editor ─────────────────────────────────────────────────────────
  const updateQuestion = (index, field, value) => {
    setGeneratedQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (!isAuthenticated() || user?.role !== "ROLE_TEACHER") return null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0, color: "#343a40" }}>🤖 AI Quiz Generator</h1>
          <p style={{ margin: "0.3rem 0 0", color: "#6c757d" }}>
            Generate quiz questions from your study materials using RAG + Gemini
          </p>
        </div>
        <button
          style={{ ...styles.btn, backgroundColor: "#6c757d", color: "#fff" }}
          onClick={() => navigate("/teacher-dashboard")}
        >
          ← Back
        </button>
      </div>

      {error && <div style={styles.alert("error")}>{error}</div>}
      {success && <div style={styles.alert("success")}>{success}</div>}

      {/* ── Configuration panel (hidden once preview is shown) ── */}
      {!showPreview && (
        <>
          {/* Material selection */}
          <div style={styles.card}>
            <p style={styles.sectionTitle}>
              📚 Select Study Materials ({selectedMaterialIds.length} selected)
            </p>
            {materials.length === 0 ? (
              <p style={{ color: "#6c757d" }}>
                No materials found.{" "}
                <span
                  style={{ color: "#007bff", cursor: "pointer" }}
                  onClick={() => navigate("/upload-material")}
                >
                  Upload materials
                </span>{" "}
                first.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "0.75rem",
                }}
              >
                {materials.map((mat) => {
                  const selected = selectedMaterialIds.includes(mat.id);
                  return (
                    <div
                      key={mat.id}
                      onClick={() => toggleMaterial(mat.id)}
                      style={{
                        border: `2px solid ${selected ? "#28a745" : "#dee2e6"}`,
                        borderRadius: "8px",
                        padding: "0.9rem",
                        cursor: "pointer",
                        backgroundColor: selected ? "#f0fff4" : "#fff",
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "600",
                          fontSize: "0.95rem",
                          color: "#343a40",
                        }}
                      >
                        {selected ? "✅ " : ""}
                        {mat.title}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#6c757d",
                          marginTop: "0.3rem",
                        }}
                      >
                        {mat.category} •{" "}
                        {mat.transcript
                          ? `${mat.transcript.length} chars`
                          : "⚠️ No transcript"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quiz parameters */}
          <div style={styles.card}>
            <p style={styles.sectionTitle}>⚙️ Quiz Parameters</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <label style={styles.label}>Quiz Title *</label>
                <input
                  style={styles.input}
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g. Chapter 3 Assessment"
                />
              </div>
              <div>
                <label style={styles.label}>Category *</label>
                <input
                  style={styles.input}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div>
                <label style={styles.label}>Number of Questions</label>
                <select
                  style={styles.select}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                >
                  {[5, 10, 15, 20].map((n) => (
                    <option key={n} value={n}>
                      {n} questions
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={styles.label}>Difficulty</label>
                <select
                  style={styles.select}
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <button
              style={{
                ...styles.btn,
                backgroundColor: loading ? "#6c757d" : "#007bff",
                color: "#fff",
                marginTop: "0.5rem",
              }}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "⏳ Generating…" : "✨ Generate Quiz"}
            </button>
          </div>
        </>
      )}

      {/* ── Preview panel ── */}
      {showPreview && generatedQuestions.length > 0 && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2 style={{ margin: 0, color: "#343a40" }}>
              📋 Review Generated Questions ({generatedQuestions.length})
            </h2>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                style={{
                  ...styles.btn,
                  backgroundColor: "#6c757d",
                  color: "#fff",
                }}
                onClick={handleDiscard}
                disabled={saving}
              >
                🗑️ Discard
              </button>
              <button
                style={{
                  ...styles.btn,
                  backgroundColor: "#007bff",
                  color: "#fff",
                }}
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? "⏳ Re-generating…" : "🔄 Regenerate"}
              </button>
              <button
                style={{
                  ...styles.btn,
                  backgroundColor: saving ? "#6c757d" : "#28a745",
                  color: "#fff",
                }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "⏳ Saving…" : "💾 Save Quiz"}
              </button>
            </div>
          </div>

          <p style={{ color: "#6c757d", marginBottom: "1.5rem" }}>
            Review and optionally edit questions before saving.
            Click <strong>Save Quiz</strong> to persist to the database, or{" "}
            <strong>Discard</strong> to start over.
          </p>

          {generatedQuestions.map((q, idx) => (
            <div key={idx} style={{ ...styles.card, borderLeft: "4px solid #007bff" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                }}
              >
                <span
                  style={{
                    backgroundColor: "#007bff",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </span>
                <span
                  style={{
                    backgroundColor: "#e9ecef",
                    color: "#495057",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    fontWeight: "500",
                  }}
                >
                  {q.difficultylevel}
                </span>
              </div>

              {/* Question title */}
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={styles.label}>Question</label>
                <input
                  style={{ ...styles.input, marginBottom: 0 }}
                  value={q.questionTitle}
                  onChange={(e) =>
                    updateQuestion(idx, "questionTitle", e.target.value)
                  }
                />
              </div>

              {/* Options */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                {["option1", "option2", "option3", "option4"].map((opt, oi) => (
                  <div key={opt}>
                    <label style={{ ...styles.label, color: "#6c757d" }}>
                      Option {oi + 1}
                    </label>
                    <input
                      style={{
                        ...styles.input,
                        marginBottom: 0,
                        borderColor:
                          q[opt] === q.rightAnswer ? "#28a745" : "#ced4da",
                        backgroundColor:
                          q[opt] === q.rightAnswer ? "#f0fff4" : "#fff",
                      }}
                      value={q[opt]}
                      onChange={(e) => updateQuestion(idx, opt, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* Correct answer selector */}
              <div>
                <label style={styles.label}>
                  ✅ Correct Answer
                </label>
                <select
                  style={styles.select}
                  value={q.rightAnswer}
                  onChange={(e) =>
                    updateQuestion(idx, "rightAnswer", e.target.value)
                  }
                >
                  {["option1", "option2", "option3", "option4"].map((opt) => (
                    <option key={opt} value={q[opt]}>
                      {q[opt] || `(${opt} is empty)`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          {/* Bottom action bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "1rem",
            }}
          >
            <button
              style={{ ...styles.btn, backgroundColor: "#6c757d", color: "#fff" }}
              onClick={handleDiscard}
              disabled={saving}
            >
              🗑️ Discard
            </button>
            <button
              style={{
                ...styles.btn,
                backgroundColor: saving ? "#6c757d" : "#28a745",
                color: "#fff",
              }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "⏳ Saving…" : "💾 Save Quiz"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIQuizGenerator;
