import { useState } from "react";
import "./Login.css";

const API = "http://localhost:5000";

function Login({ onLogin }) {
  const [mode, setMode] = useState("student");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [form, setForm] = useState({
    full_name: "", email: "", password: "",
    college: "", branch: "", graduation_year: "", phone: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ full_name: "", email: "", password: "", college: "", branch: "", graduation_year: "", phone: "" });
    setMessage({ text: "", type: "" });
  };

  const switchMode = (newMode) => { setMode(newMode); resetForm(); };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setMessage({ text: "Email and password are required.", type: "error" }); return;
    }
    setLoading(true);
    try {
      const endpoint = mode === "admin" ? "/api/admin/login" : "/api/student/login";
      const body = mode === "admin"
        ? { username: form.email, password: form.password }
        : { email: form.email, password: form.password };
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.status === "success") {
        setMessage({ text: "Login successful! Redirecting...", type: "success" });
        setTimeout(() => { if (onLogin) onLogin(data.data); }, 1000);
      } else {
        setMessage({ text: data.message || "Invalid credentials.", type: "error" });
      }
    } catch { setMessage({ text: "Server error. Please try again.", type: "error" }); }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!form.full_name || !form.email || !form.password) {
      setMessage({ text: "Name, email and password are required.", type: "error" }); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/student/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === "success") {
        setMessage({ text: "Registered successfully! Please login.", type: "success" });
        setTimeout(() => switchMode("student"), 1800);
      } else {
        setMessage({ text: data.message || "Registration failed.", type: "error" });
      }
    } catch { setMessage({ text: "Server error. Please try again.", type: "error" }); }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🎓</div>
        <h1 className="login-title">Campus Placement</h1>
        <p className="login-subtitle">
          {mode === "register" ? "Create your student account" : "Sign in to continue your prep"}
        </p>

        {mode === "register" ? (
          <>
            {message.text && (
              <div className={`login-msg ${message.type}`}>{message.text}</div>
            )}
            <div className="register-header">👋 New here?</div>
            <div className="register-sub">Fill in your details to get started</div>

            <label className="login-label">Full Name *</label>
            <input className="login-input" name="full_name" placeholder="Your full name" value={form.full_name} onChange={handleChange} />

            <label className="login-label">Email *</label>
            <input className="login-input" type="email" name="email" placeholder="your@email.com" value={form.email} onChange={handleChange} />

            <label className="login-label">Password *</label>
            <input className="login-input" type="password" name="password" placeholder="Create a strong password" value={form.password} onChange={handleChange} />

            <div className="login-row">
              <div>
                <label className="login-label">College</label>
                <input className="login-input" name="college" placeholder="College name" value={form.college} onChange={handleChange} />
              </div>
              <div>
                <label className="login-label">Branch</label>
                <input className="login-input" name="branch" placeholder="CSE / IT" value={form.branch} onChange={handleChange} />
              </div>
            </div>

            <div className="login-row">
              <div>
                <label className="login-label">Grad Year</label>
                <input className="login-input" name="graduation_year" placeholder="2025" value={form.graduation_year} onChange={handleChange} />
              </div>
              <div>
                <label className="login-label">Phone</label>
                <input className="login-input" name="phone" placeholder="9876543210" value={form.phone} onChange={handleChange} />
              </div>
            </div>

            <button
              className={`register-btn${loading ? " disabled" : ""}`}
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account →"}
            </button>

            <div className="back-link">
              Already have an account?{" "}
              <button className="back-link-btn" onClick={() => switchMode("student")}>Login here</button>
            </div>
          </>
        ) : (
          <>
            <div className="login-tabs">
              <button
                className={`login-tab${mode === "student" ? " active" : ""}`}
                onClick={() => switchMode("student")}
              >
                🎓 Student
              </button>
              <button
                className={`login-tab${mode === "admin" ? " active" : ""}`}
                onClick={() => switchMode("admin")}
              >
                🛡️ Admin
              </button>
            </div>

            {message.text && (
              <div className={`login-msg ${message.type}`}>{message.text}</div>
            )}

            <label className="login-label">{mode === "admin" ? "Username" : "Email"}</label>
            <input
              className="login-input"
              type={mode === "admin" ? "text" : "email"}
              name="email"
              placeholder={mode === "admin" ? "admin username" : "student@email.com"}
              value={form.email}
              onChange={handleChange}
            />

            <label className="login-label">Password</label>
            <input className="login-input" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} />

            {mode === "student" && (
              <div className="demo-hint">Demo: rahul@student.com / rahul123</div>
            )}

            <button
              className={`login-btn${loading ? " disabled" : ""}`}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login →"}
            </button>

            {mode === "student" && (
              <div className="register-line">
                New user?{" "}
                <button className="register-link" onClick={() => switchMode("register")}>Register here</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
