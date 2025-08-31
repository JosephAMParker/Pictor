import * as React from "react";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useLoginMutation, useSignupMutation } from "../bookclub/auth";

const BookClubPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");

  const [login] = useLoginMutation();
  const [signup] = useSignupMutation();

  // Check for existing token when the component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const res = await login({ username, password }).unwrap();
      localStorage.setItem("token", res.access_token);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err.data?.error || "Login failed");
    }
  };

  const handleSignup = async () => {
    try {
      const res = await signup({ username, password }).unwrap();
      localStorage.setItem("token", res.access_token);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err.data?.error || "Signup failed");
    }
  };

  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   setIsLoggedIn(false);
  //   setUsername("");
  //   setPassword("");
  // };

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
