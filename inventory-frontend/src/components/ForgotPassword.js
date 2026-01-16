import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "If an account exists with that email, a password reset link has been sent.");
        setEmail("");
      } else {
        setError(data.error || "Failed to process request");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Reset Password</h1>
        <p style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <div style={styles.successMessage}>
            <span style={styles.icon}>✅</span>
            {message}
          </div>
        )}

        {error && (
          <div style={styles.errorMessage}>
            <span style={styles.icon}>⚠️</span>
            {error}
          </div>
        )}

        <div style={styles.footer}>
          <button 
            onClick={() => navigate("/")} 
            style={styles.backLink}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    padding: "40px",
    width: "100%",
    maxWidth: "450px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#234848",
    marginBottom: "12px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    textAlign: "center",
    marginBottom: "30px",
    lineHeight: "1.5",
  },
  form: {
    marginBottom: "20px",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#234848",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.3s",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "14px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  successMessage: {
    padding: "16px",
    background: "#d1fae5",
    border: "2px solid #10b981",
    borderRadius: "8px",
    color: "#065f46",
    fontSize: "14px",
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  errorMessage: {
    padding: "16px",
    background: "#fee2e2",
    border: "2px solid #ef4444",
    borderRadius: "8px",
    color: "#991b1b",
    fontSize: "14px",
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  icon: {
    fontSize: "18px",
  },
  footer: {
    marginTop: "30px",
    textAlign: "center",
  },
  backLink: {
    background: "none",
    border: "none",
    color: "#667eea",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
  },
};

export default ForgotPassword;

