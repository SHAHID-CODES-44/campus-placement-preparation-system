import "./App.css";
import { useState } from "react";
import cp from "./assets/cp1.mp4";
import Login from "./components/Login";
import AdminDashboard from "./components/admin/AdminDashboard";
import StudentDashboard from "./components/student/StudentDashboard";

function App() {
  const [page, setPage] = useState("home"); // home | login | admin | student
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setPage(userData.role === "admin" ? "admin" : "student");
  };

  const handleLogout = () => {
    setUser(null);
    setPage("home");
  };

  if (page === "login")
    return <Login onLogin={handleLogin} onBack={() => setPage("home")} />;
  if (page === "admin")
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  if (page === "student")
    return <StudentDashboard user={user} onLogout={handleLogout} />;

  // HOME / LANDING PAGE
  return (
    <div className="App">
      <video autoPlay muted loop playsInline className="video-bg">
        <source src={cp} type="video/mp4" />
      </video>

      <div className="home-overlay">
        <div className="home-content">
          <div className="home-badge">🎓 Placement Prep Platform</div>
          <h1 className="home-title">
            Campus <span className="home-title-accent">Placement</span>
            <br />
            Preparation System
          </h1>
          <p className="home-subtitle">
            Aptitude tests · Technical Q&amp;A ·
            Company-wise prep — all in one place.
          </p>
          <div className="home-stats">
            <div className="home-stat">
              <span>10+</span>
              <small>Aptitude Qs</small>
            </div>
            <div className="home-stat-divider"></div>
            <div className="home-stat">
              <span>10+</span>
              <small>Technical Qs</small>
            </div>
            <div className="home-stat-divider"></div>
            <div className="home-stat">
              <span>7+</span>
              <small>Companies</small>
            </div>
          </div>
          <button className="home-btn" onClick={() => setPage("login")}>
            Get Started →
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
