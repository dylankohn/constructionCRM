import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BASE_URL } from "../config";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Invalid or missing reset token. Please request a new password reset link.");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError("Invalid reset token");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Password reset successful!");
        setPassword("");
        setConfirmPassword("");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { label: "", color: "" };
    
    if (password.length < 6) {
      return { label: "Too short", color: "#ef4444" };
    } else if (password.length < 8) {
      return { label: "Weak", color: "#f59e0b" };
    } else if (password.length < 12) {
      return { label: "Good", color: "#10b981" };
    } else {
      return { label: "Strong", color: "#059669" };
    }
  };

  const strength = getPasswordStrength();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create New Password</h1>
        <p style={styles.subtitle}>
          Enter your new password below.
        </p>

        {!token ? (
          <div style={styles.errorMessage}>
            <span style={styles.icon}>⚠️</span>
            Invalid or missing reset token. 
            <button 
              onClick={() => navigate("/forgot-password")} 
              style={styles.linkButton}
            >
              Request a new link
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                disabled={loading}
              />
              {password && (
                <div style={styles.strengthIndicator}>
                  <div 
                    style={{
                      ...styles.strengthBar,
                      width: `${(password.length / 12) * 100}%`,
                      backgroundColor: strength.color
                    }}
                  />
                  <span style={{ color: strength.color, fontSize: "12px", marginTop: "4px" }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  ...styles.input,
                  ...(confirmPassword && password !== confirmPassword ? styles.inputError : {})
                }}
                disabled={loading}
              />
              {confirmPassword && password !== confirmPassword && (
                <span style={styles.errorText}>Passwords do not match</span>
              )}
            </div>

            <button 
              type="submit" 
              style={{
                ...styles.button,
                ...(loading || !password || password !== confirmPassword ? styles.buttonDisabled : {})
              }}
              disabled={loading || !password || password !== confirmPassword}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {message && (
          <div style={styles.successMessage}>
            <span style={styles.icon}>✅</span>
            {message}
            <div style={styles.redirectText}>Redirecting to login...</div>
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
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    fontSize: "12px",
    color: "#ef4444",
    marginTop: "4px",
    display: "block",
  },
  strengthIndicator: {
    marginTop: "8px",
  },
  strengthBar: {
    height: "4px",
    borderRadius: "2px",
    transition: "all 0.3s",
    marginBottom: "4px",
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
    flexDirection: "column",
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
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    textAlign: "center",
  },
  icon: {
    fontSize: "18px",
  },
  redirectText: {
    fontSize: "12px",
    fontStyle: "italic",
    marginTop: "4px",
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
  linkButton: {
    background: "none",
    border: "none",
    color: "#991b1b",
    textDecoration: "underline",
    cursor: "pointer",
    marginLeft: "4px",
    fontWeight: "600",
  },
};

export default ResetPassword;

