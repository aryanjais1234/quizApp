import { useState } from "react";
import { uploadMaterial } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const UploadMaterial = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isAuthenticated() || user?.role !== "ROLE_TEACHER") {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title || !category) {
      setError("Title, category and file are required.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");
      await uploadMaterial(file, title, description, category);
      setSuccess("Material uploaded successfully!");
      setTitle("");
      setDescription("");
      setCategory("");
      setFile(null);
      e.target.reset();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Failed to upload material. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem",
          borderBottom: "2px solid #e9ecef",
          paddingBottom: "1rem",
        }}
      >
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
          ← Back
        </button>
        <h1 style={{ color: "#343a40", margin: 0 }}>Upload Lecture Material</h1>
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

      {success && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#d4edda",
            color: "#155724",
            border: "1px solid #c3e6cb",
            borderRadius: "4px",
            marginBottom: "1.5rem",
          }}
        >
          {success}{" "}
          <button
            onClick={() => navigate("/teacher-materials")}
            style={{
              background: "none",
              border: "none",
              color: "#155724",
              fontWeight: "600",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            View all materials →
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #dee2e6",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ marginBottom: "1.25rem" }}>
          <label
            style={{
              display: "block",
              fontWeight: "600",
              color: "#495057",
              marginBottom: "0.4rem",
            }}
          >
            Title <span style={{ color: "#dc3545" }}>*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction to Neural Networks"
            required
            style={{
              width: "100%",
              padding: "0.65rem 0.9rem",
              border: "1px solid #ced4da",
              borderRadius: "6px",
              fontSize: "1rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label
            style={{
              display: "block",
              fontWeight: "600",
              color: "#495057",
              marginBottom: "0.4rem",
            }}
          >
            Category <span style={{ color: "#dc3545" }}>*</span>
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Machine Learning, Mathematics, Computer Science"
            required
            style={{
              width: "100%",
              padding: "0.65rem 0.9rem",
              border: "1px solid #ced4da",
              borderRadius: "6px",
              fontSize: "1rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label
            style={{
              display: "block",
              fontWeight: "600",
              color: "#495057",
              marginBottom: "0.4rem",
            }}
          >
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the material..."
            rows={3}
            style={{
              width: "100%",
              padding: "0.65rem 0.9rem",
              border: "1px solid #ced4da",
              borderRadius: "6px",
              fontSize: "1rem",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "1.75rem" }}>
          <label
            style={{
              display: "block",
              fontWeight: "600",
              color: "#495057",
              marginBottom: "0.4rem",
            }}
          >
            File <span style={{ color: "#dc3545" }}>*</span>
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.mp4,.mp3"
            required
            style={{
              width: "100%",
              padding: "0.65rem 0.9rem",
              border: "1px dashed #ced4da",
              borderRadius: "6px",
              fontSize: "1rem",
              backgroundColor: "#f8f9fa",
              boxSizing: "border-box",
            }}
          />
          <p style={{ margin: "0.4rem 0 0", fontSize: "0.85rem", color: "#6c757d" }}>
            Supported formats: PDF, Word, PowerPoint, Text, MP4, MP3. Max 50 MB.
          </p>
        </div>

        <button
          type="submit"
          disabled={uploading}
          style={{
            width: "100%",
            padding: "0.85rem",
            backgroundColor: uploading ? "#6c757d" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.05rem",
            fontWeight: "600",
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        >
          {uploading ? "Uploading..." : "Upload Material"}
        </button>
      </form>
    </div>
  );
};

export default UploadMaterial;
