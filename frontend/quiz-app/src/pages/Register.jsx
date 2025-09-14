import { useState } from "react";
import { register as registerApi } from "../api/api";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [userData, setUserData] = useState({
    username: "",
    password: "",
    role: "STUDENT",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await registerApi(userData);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.log("Registration error:", err);
      const res = err.response;
      let message = "Registration failed. Please try again.";
      if (res) {
        if (typeof res.data === "string") {
          // Backend returned a plain string error (e.g., 403: "User already exists")
          message = res.data;
        } else if (res.data?.message) {
          message = res.data.message;
        } else if (res.status === 403) {
          message = "Forbidden";
        }
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          padding: "2rem",
          maxWidth: "400px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2>Registration Successful!</h2>
        <p>Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={userData.username}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Role:</label>
          <select
            name="role"
            value={userData.role}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          >
            <option value="STUDENT">STUDENT</option>
            <option value="TEACHER">TEACHER</option>
          </select>
        </div>

        {error && (
          <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "1rem" }}>
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
};

export default Register;
