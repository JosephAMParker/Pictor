import * as React from "react";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useLoginMutation, useSignupMutation } from "../bookclub/api/authApi";
import { apiUrl } from "../Constants";

const BookClubPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");

  const [login] = useLoginMutation();
  const [signup] = useSignupMutation();

  // Attempt to refresh access token if missing or expired
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        await refreshAccessToken();
      } else {
        setIsLoggedIn(true);
      }
    };

    const refreshAccessToken = async (): Promise<void> => {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) return;

      try {
        const res = await fetch(`${apiUrl}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshToken}`,
          },
        });
        if (!res.ok) throw new Error("Failed to refresh token");
        const data = await res.json();
        localStorage.setItem("access_token", data.access_token);
        setIsLoggedIn(true);
      } catch (err) {
        console.error("Refresh failed", err);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setIsLoggedIn(false);
      }
    };

    initAuth();
  }, []);

  const handleLogin = async () => {
    try {
      const res = await login({ username, password }).unwrap();
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err.data?.error || "Login failed");
    }
  };

  const handleSignup = async () => {
    try {
      const res = await signup({ username, password }).unwrap();
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err.data?.error || "Signup failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
  };
  if (!isLoggedIn) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Book Club Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ display: "block", marginBottom: "0.5rem" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", marginBottom: "0.5rem" }}
        />
        <button onClick={handleLogin} style={{ marginRight: "1rem" }}>
          Log In
        </button>
        <button onClick={handleSignup}>Sign Up</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <Outlet />
    </div>
  );
};

export default BookClubPage;
