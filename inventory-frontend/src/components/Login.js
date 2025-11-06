import React, { useState } from "react";
import { BASE_URL } from "../config";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? "/auth/register" : "/auth/login";

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.user || { id: data.userId, username });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="login-container">
      <h1>{isRegister ? "Create Account" : "Login"}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isRegister ? "Register" : "Login"}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>
        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? "Login" : "Create Account"}
        </span>
      </p>
    </div>
  );
}

export default Login;
