import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import CustomerJobs from "./components/CustomerJobs";
import JobDetails from "./components/JobDetails";
import JobMaterials from "./components/JobMaterials";
import "./styles.css";

function App() {
  const [user, setUser] = useState(null); // Logged-in user
  const [loading, setLoading] = useState(true); // Loading state for session check

  // Check for saved user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Error parsing saved user:", err);
        localStorage.removeItem("user");
      }
    }
    setLoading(false); // Done checking for saved session
  }, []);

  // Wrapper function to save user to localStorage
  const handleSetUser = (userData) => {
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } else {
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  // Show nothing while checking for saved session
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        color: "#6b7280"
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login setUser={handleSetUser} /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={user ? <Dashboard user={user} setUser={handleSetUser} /> : <Navigate to="/login" />}
        />
        <Route
          path="/customer/:customerId/jobs"
          element={user ? <CustomerJobs user={user} setUser={handleSetUser} /> : <Navigate to="/login" />}
        />
        <Route
          path="/customer/:customerId/job/:jobId"
          element={user ? <JobDetails user={user} setUser={handleSetUser} /> : <Navigate to="/login" />}
        />
        <Route
          path="/customer/:customerId/job/:jobId/materials"
          element={user ? <JobMaterials user={user} setUser={handleSetUser} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
