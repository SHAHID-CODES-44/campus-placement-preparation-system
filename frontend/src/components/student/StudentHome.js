import { useState, useEffect } from "react";
import api from "../../api";
import { StatCard, Badge, Loader } from "../shared/UIKit";
import "./StudentDashboard.css";
import "../admin/AdminDashboard.css";

function StudentHome({ studentId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    api(`/api/student/dashboard/${studentId}`).then(
      (r) => r.status === "success" && setData(r.data),
    );
  }, [studentId]);

  if (!data) return <Loader />;

  const { student, test_stats, recent_tests, notifications } = data;

  return (
    <div>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-name">
          Hello, {student?.full_name?.split(" ")[0]}! 👋
        </div>
        <div className="welcome-sub">
          {student?.college} • {student?.branch} • Keep practising for your
          dream company! 🚀
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard
          icon="🧮"
          label="Tests Taken"
          value={test_stats.total_tests}
        />
        <StatCard
          icon="📊"
          label="Avg Score"
          value={`${test_stats.avg_score}%`}
        />
        <StatCard
          icon="⭐"
          label="Best Score"
          value={`${test_stats.best_score}%`}
        />
        <StatCard
          icon="✅"
          label="Total Correct"
          value={test_stats.total_correct}
        />
      </div>

      <div className="grid-2">
        {/* Recent Tests */}
        <div className="kit-card" style={{ padding: 20 }}>
          <h6 style={{ fontWeight: 700, color: "#1a202c", marginBottom: 16 }}>
            📊 Recent Tests
          </h6>
          {recent_tests.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
                color: "#a0aec0",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>🧮</div>
              <p style={{ margin: 0, fontSize: "0.88rem" }}>
                No tests yet — go to Aptitude Test to start!
              </p>
            </div>
          ) : (
            recent_tests.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "11px 14px",
                  background: "#f7fafc",
                  borderRadius: 10,
                  marginBottom: 8,
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      textTransform: "capitalize",
                    }}
                  >
                    {t.test_type} Test
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#718096" }}>
                    {t.total_questions} Qs •{" "}
                    {new Date(t.completed_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Badge
                    label={`${t.score}%`}
                    color={
                      t.score >= 70 ? "green" : t.score >= 40 ? "yellow" : "red"
                    }
                  />
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "#a0aec0",
                      marginTop: 3,
                    }}
                  >
                    {t.correct_answers}✓ {t.wrong_answers}✗
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Notifications */}
        <div className="kit-card" style={{ padding: 20 }}>
          <h6 style={{ fontWeight: 700, color: "#1a202c", marginBottom: 16 }}>
            🔔 Latest Notifications
          </h6>
          {notifications.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
                color: "#a0aec0",
              }}
            >
              <p style={{ margin: 0, fontSize: "0.88rem" }}>
                No notifications.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  background: "#ebf8ff",
                  borderRadius: 10,
                  padding: "12px 14px",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "#1e40af",
                    marginBottom: 3,
                  }}
                >
                  {n.title}
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "#2b6cb0",
                    lineHeight: 1.4,
                  }}
                >
                  {n.message}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentHome;
