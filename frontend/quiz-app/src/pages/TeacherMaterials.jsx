import { useState, useEffect } from "react";
import { getMyMaterials, deleteMaterial, updateTranscript } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const TeacherMaterials = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTranscript, setEditingTranscript] = useState(null);
  const [transcriptText, setTranscriptText] = useState("");
  const [savingTranscript, setSavingTranscript] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== "ROLE_TEACHER") {
      navigate("/login");
      return;
    }
    fetchMaterials();
  }, [isAuthenticated, user, navigate]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await getMyMaterials();
      setMaterials(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching materials:", err);
      setError("Failed to load materials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    try {
      await deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete material.");
    }
  };

  const openTranscriptEditor = (material) => {
    setEditingTranscript(material.id);
    setTranscriptText(material.transcript || "");
  };

  const handleSaveTranscript = async (id) => {
    try {
      setSavingTranscript(true);
      const response = await updateTranscript(id, transcriptText);
      setMaterials((prev) =>
        prev.map((m) => (m.id === id ? response.data : m))
      );
      setEditingTranscript(null);
    } catch (err) {
      console.error("Transcript save error:", err);
      alert("Failed to save transcript.");
    } finally {
      setSavingTranscript(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return "📄";
    if (fileType.includes("pdf")) return "📕";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) return "📊";
    if (fileType.includes("video")) return "🎥";
    if (fileType.includes("audio")) return "🎵";
    if (fileType.includes("text")) return "📃";
    return "📄";
  };

  if (!isAuthenticated() || user?.role !== "ROLE_TEACHER") return null;

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Loading your materials...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          borderBottom: "2px solid #e9ecef",
          paddingBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => navigate("/teacher-dashboard")}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ← Dashboard
          </button>
          <h1 style={{ color: "#343a40", margin: 0 }}>My Lecture Materials</h1>
        </div>
        <button
          onClick={() => navigate("/upload-material")}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
            fontSize: "1rem",
          }}
        >
          + Upload New Material
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb",
            borderRadius: "4px",
            marginBottom: "1.5rem",
          }}
        >
          {error}
        </div>
      )}

      {materials.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "2px dashed #dee2e6",
          }}
        >
          <h3 style={{ color: "#6c757d", marginBottom: "1rem" }}>
            No Materials Uploaded Yet
          </h3>
          <p style={{ color: "#6c757d", marginBottom: "1.5rem" }}>
            Upload lecture notes, PDFs, or transcripts for your students.
          </p>
          <button
            onClick={() => navigate("/upload-material")}
            style={{
              padding: "0.75rem 2rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "1rem",
            }}
          >
            Upload Your First Material
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {materials.map((material) => (
            <div
              key={material.id}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #dee2e6",
                borderRadius: "12px",
                padding: "1.5rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "0.75rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "2rem" }}>{getFileIcon(material.fileType)}</span>
                  <div>
                    <h3 style={{ margin: 0, color: "#343a40", fontSize: "1.15rem" }}>
                      {material.title}
                    </h3>
                    <span
                      style={{
                        backgroundColor: "#007bff",
                        color: "white",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        marginTop: "0.25rem",
                        display: "inline-block",
                      }}
                    >
                      {material.category}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "0.4rem 0.9rem",
                      backgroundColor: "#17a2b8",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500",
                      fontSize: "0.85rem",
                      textDecoration: "none",
                    }}
                  >
                    View File
                  </a>
                  <button
                    onClick={() => openTranscriptEditor(material)}
                    style={{
                      padding: "0.4rem 0.9rem",
                      backgroundColor: "#ffc107",
                      color: "#212529",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500",
                      fontSize: "0.85rem",
                    }}
                  >
                    {material.transcript ? "Edit Transcript" : "Add Transcript"}
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    style={{
                      padding: "0.4rem 0.9rem",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500",
                      fontSize: "0.85rem",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {material.description && (
                <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.95rem" }}>
                  {material.description}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  marginTop: "0.5rem",
                  fontSize: "0.85rem",
                  color: "#868e96",
                }}
              >
                <span>📅 {formatDate(material.uploadedAt)}</span>
                <span>📦 {formatFileSize(material.fileSize)}</span>
                <span>📎 {material.fileName}</span>
                {material.transcript && (
                  <span style={{ color: "#28a745" }}>✓ Transcript available</span>
                )}
              </div>

              {editingTranscript === material.id && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    border: "1px solid #dee2e6",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      color: "#495057",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Transcript / Lecture Notes
                  </label>
                  <textarea
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    rows={6}
                    placeholder="Paste or type the lecture transcript here..."
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      border: "1px solid #ced4da",
                      borderRadius: "6px",
                      fontSize: "0.95rem",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
                    <button
                      onClick={() => handleSaveTranscript(material.id)}
                      disabled={savingTranscript}
                      style={{
                        padding: "0.5rem 1.25rem",
                        backgroundColor: savingTranscript ? "#6c757d" : "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: savingTranscript ? "not-allowed" : "pointer",
                        fontWeight: "500",
                      }}
                    >
                      {savingTranscript ? "Saving..." : "Save Transcript"}
                    </button>
                    <button
                      onClick={() => setEditingTranscript(null)}
                      style={{
                        padding: "0.5rem 1.25rem",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "500",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherMaterials;
