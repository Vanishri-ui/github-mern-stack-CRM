// src/VivaLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/vivaLogin.css";

const USERS = {
  admin:    { password: "admin123",   role: "admin" },
  sales:    { password: "sales123",   role: "sales" },
  support:  { password: "support123", role: "support" },
  dev:      { password: "dev123",     role: "developer" },
  billing:  { password: "billing123", role: "billing" },
  finance:  { password: "finance123", role: "finance" },
};

function VivaLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const trimmedUser = form.username.trim().toLowerCase();
    const userRecord = USERS[trimmedUser];

    if (!userRecord || userRecord.password !== form.password) {
      alert("Invalid username or password");
      return;
    }

    // Decide which page to go based on role
    switch (userRecord.role) {
      case "admin":
        navigate("/admin");
        break;
      case "sales":
        navigate("/sales");
        break;
      case "support":
        navigate("/support");
        break;
      case "developer":
        navigate("/developer");
        break;
      case "billing":
        navigate("/billing");
        break;
      case "finance":
        navigate("/finance");
        break;
      default:
        // fallback if role doesn't match anything
        navigate("/admin");
    }
  };

  return (
    <div className="viva-page">
      {/* Left image / hero section */}
      <div className="viva-hero">
        <div className="viva-hero-overlay">
          <h1 className="viva-hero-title">Welcome to Viva Meet</h1>
          <p className="viva-hero-subtitle">
            Secure meetings, team collaboration and smart communication.
          </p>
        </div>
      </div>

      {/* Right login panel */}
      <div className="viva-panel">
        <div className="viva-panel-inner">
          {/* Logo + title */}
          <div className="viva-logo-row">
            <div className="viva-logo-circle">V</div>
            <div className="viva-logo-text">
              <span className="viva-logo-name">Viva Meet</span>
              <span className="viva-logo-tagline">Workspace Login</span>
            </div>
          </div>

          <h2 className="viva-heading">Welcome back</h2>
          <p className="viva-subheading">
            Sign in using your department credentials.
          </p>

          {/* Login form */}
          <form className="viva-form" onSubmit={handleLogin}>
            <div className="viva-field">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="e.g. admin, sales, support"
                value={form.username}
                onChange={handleChange}
              />
            </div>

            <div className="viva-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <button className="viva-btn" type="submit">
              Login
            </button>
          </form>

          <div className="viva-footer">
            © 2025 Viva Communication Pvt Ltd
          </div>
        </div>
      </div>
    </div>
  );
}

export default VivaLogin;