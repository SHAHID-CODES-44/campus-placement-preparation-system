import { useState, useEffect } from "react";
import api from "../../api";
import { Badge, Loader, Empty } from "../shared/UIKit";
import "../admin/AdminDashboard.css";

function StudentResults({ studentId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    api(`/api/reports/student/${studentId}`).then(
      (r) => r.status === "success" && setData(r.data),
    );
  }, [studentId]);

  if (!data) return <Loader />;

  const fmt = (s) => `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <div>
      <div className="page-title">My Performance</div>
      <div className="page-subtitle">
        Your complete test history and analytics
      </div>

      {/* By Type Stats */}
      {data.by_type.length > 0 && (
        <div className="grid-2" style={{ marginBottom: 24 }}>
          {data.by_type.map((t) => (
            <div key={t.test_type} className="kit-card" style={{ padding: 20 }}>
              <h6
                style={{
                  fontWeight: 700,
                  color: "#1a202c",
                  textTransform: "capitalize",
                  marginBottom: 16,
                }}
              >
                {t.test_type} Tests
              </h6>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                  textAlign: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 800,
                      color: "#3182ce",
                    }}
                  >
                    {t.attempts}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#718096" }}>
                    Attempts
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 800,
                      color: "#38a169",
                    }}
                  >
                    {Number(t.avg_score).toFixed(1)}%
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#718096" }}>
                    Avg Score
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 800,
                      color: "#805ad5",
                    }}
                  >
                    {Number(t.best_score).toFixed(1)}%
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#718096" }}>
                    Best Score
                  </div>
                </div>
              </div>
              {/* Mini progress bar */}
              <div style={{ marginTop: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    color: "#718096",
                    marginBottom: 4,
                  }}
                >
                  <span>Average Score</span>
                  <span>{Number(t.avg_score).toFixed(1)}%</span>
                </div>
                <div className="prog-bar-wrap">
                  <div
                    className="prog-bar-fill"
                    style={{ width: `${t.avg_score || 0}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Tests Table */}
      <div className="kit-card">
        <div
          style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}
        >
          <h6 style={{ margin: 0, fontWeight: 700, color: "#1a202c" }}>
            All Test History ({data.all_tests.length})
          </h6>
        </div>
        {data.all_tests.length === 0 ? (
          <Empty text="No tests attempted yet. Go to Aptitude Test to start!" />
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Test Type</th>
                  <th>Questions</th>
                  <th>Correct</th>
                  <th>Wrong</th>
                  <th>Score</th>
                  <th>Time</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.all_tests.map((t, i) => (
                  <tr key={t.id}>
                    <td style={{ color: "#a0aec0" }}>{i + 1}</td>
                    <td
                      style={{ fontWeight: 600, textTransform: "capitalize" }}
                    >
                      {t.test_type}
                    </td>
                    <td style={{ textAlign: "center" }}>{t.total_questions}</td>
                    <td
                      style={{
                        textAlign: "center",
                        color: "#38a169",
                        fontWeight: 700,
                      }}
                    >
                      {t.correct_answers}
                    </td>
                    <td style={{ textAlign: "center", color: "#e53e3e" }}>
                      {t.wrong_answers}
                    </td>
                    <td>
                      <Badge
                        label={`${t.score}%`}
                        color={
                          t.score >= 70
                            ? "green"
                            : t.score >= 40
                              ? "yellow"
                              : "red"
                        }
                      />
                    </td>
                    <td style={{ color: "#718096" }}>{fmt(t.time_taken)}</td>
                    <td style={{ color: "#a0aec0", fontSize: "0.78rem" }}>
                      {new Date(t.completed_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentResults;
