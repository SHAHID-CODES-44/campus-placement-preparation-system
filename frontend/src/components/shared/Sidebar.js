import "./Sidebar.css";

const NAV = {
  admin: [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "students", icon: "👥", label: "Students" },
    { id: "materials", icon: "📚", label: "Study Materials" },
    { id: "aptitude", icon: "🧮", label: "Aptitude Questions" },
    { id: "technical", icon: "💻", label: "Technical Questions" },
    {id:"tracker", icon:"📝",label:"ApplicationTracker"},
    { id: "companies", icon: "🏢", label: "Companies" },
    { id: "notifications", icon: "🔔", label: "Notifications" },
    { id: "reports", icon: "📈", label: "Reports" },
  ],
  student: [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "materials", icon: "📚", label: "Study Materials" },
    { id: "aptitude-test", icon: "🧮", label: "Aptitude Test" },
    { id: "technical-q", icon: "💻", label: "Technical Q&A" },
    {id:"tracker", icon:"📝",label:"ApplicationTracker"},
    { id: "companies", icon: "🏢", label: "Company Prep" },
    { id: "results", icon: "📈", label: "My Results" },
    { id: "notifications", icon: "🔔", label: "Notifications" },
  ],
};

function Sidebar({ role, active, setActive, user, onLogout }) {
  const nav = NAV[role] || [];

  return (
    <div className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🎓</div>
        <div>
          <div className="sidebar-brand-name">Campus Prep</div>
          <div className="sidebar-brand-role">{role} Panel</div>
        </div>
      </div>

      {/* User Info */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">
          {user?.full_name?.[0] || user?.username?.[0] || "U"}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">
            {user?.full_name || user?.username}
          </div>
          <div className="sidebar-user-email">
            {user?.email || user?.college || ""}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {nav.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${active === item.id ? "active" : ""}`}
            onClick={() => setActive(item.id)}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span className="sidebar-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button className="sidebar-logout" onClick={onLogout}>
        🚪 Logout
      </button>
    </div>
  );
}

export default Sidebar;
