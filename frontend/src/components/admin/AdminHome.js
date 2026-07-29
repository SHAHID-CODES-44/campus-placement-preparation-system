import { useState, useEffect } from "react";
import api from "../../api";
import { StatCard, Card, Badge, Loader } from "../shared/UIKit";
import "./AdminDashboard.css";

function AdminHome() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api("/api/admin/dashboard").then(
      (r) => r.status === "success" && setData(r.data),
    );
  }, []);

  if (!data) return <Loader />;

  return (
    <div>
      <div className="page-title">Admin Dashboard</div>
      <div className="page-subtitle">
        Welcome back! Here's an overview of the platform.
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <StatCard
          icon="👥"
          label="Total Students"
          value={data.total_students}
          color="blue"
        />
        <StatCard
          icon="📚"
          label="Study Materials"
          value={data.total_materials}
          color="green"
        />
        <StatCard
          icon="🧮"
          label="Aptitude Questions"
          value={data.total_aptitude}
          color="purple"
        />
        <StatCard
          icon="💻"
          label="Technical Questions"
          value={data.total_technical}
          color="orange"
        />
        
        <StatCard
          icon="📊"
          label="Avg Test Score"
          value={`${data.avg_score}%`}
          color="teal"
        />
      </div>

      <div className="grid-2">
        {/* Recent Students */}
        <div className="kit-card" style={{ padding: 20 }}>
          <h6 style={{ fontWeight: 700, color: "#1a202c", marginBottom: 16 }}>
            👋 Recent Students
          </h6>
          {data.recent_students.length === 0 ? (
            <p style={{ color: "#a0aec0", fontSize: "0.88rem" }}>
              No students yet.
            </p>
          ) : (
            data.recent_students.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div className="avatar">{s.full_name[0]}</div>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      color: "#1a202c",
                    }}
                  >
                    {s.full_name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#718096" }}>
                    {s.college || "—"} •{" "}
                    {new Date(s.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Top Scorers */}
        <div className="kit-card" style={{ padding: 20 }}>
          <h6 style={{ fontWeight: 700, color: "#1a202c", marginBottom: 16 }}>
            🏆 Top Scorers
          </h6>
          {data.top_scorers.length === 0 ? (
            <p style={{ color: "#a0aec0", fontSize: "0.88rem" }}>
              No tests attempted yet.
            </p>
          ) : (
            data.top_scorers.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "1.2rem" }}>
                    {["🥇", "🥈", "🥉", "4️⃣", "5️⃣"][i]}
                  </span>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        color: "#1a202c",
                      }}
                    >
                      {s.full_name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#718096" }}>
                      {s.college || "—"}
                    </div>
                  </div>
                </div>
                <Badge
                  label={`${Number(s.best_score).toFixed(1)}%`}
                  color="green"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminHome;
