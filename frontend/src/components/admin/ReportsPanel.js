import { useState, useEffect } from "react";
import api from "../../api";
import { Badge, Empty, Loader } from "../shared/UIKit"; // Removed StatCard as it's unused here
import "../admin/AdminDashboard.css";

function ReportsPanel() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Calling the updated backend route (without /api prefix as per your previous error)
    api("/reports/overall").then(
      (r) => r.status === "success" && setData(r.data),
    );
  }, []);

  if (!data) return <Loader />;

  return (
    <div>
      <div className="page-title">Overall Reports</div>
      <div className="page-subtitle">Platform-wide performance summary</div>

      {/* Question Bank Stats - CHANGED grid-3 to grid-2 */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        <div className="kit-card" style={{ padding: 22, textAlign: "center" }}>
          <div style={{ fontSize: "2.2rem", marginBottom: 6 }}>🧮</div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#2b6cb0" }}>
            {data.question_stats.aptitude}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#718096", marginTop: 2 }}>
            Aptitude Questions
          </div>
        </div>
        
        <div className="kit-card" style={{ padding: 22, textAlign: "center" }}>
          <div style={{ fontSize: "2.2rem", marginBottom: 6 }}>💻</div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#805ad5" }}>
            {data.question_stats.technical}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#718096", marginTop: 2 }}>
            Technical Questions
          </div>
        </div>
        {/* CODING CHALLENGES BLOCK DELETED FROM HERE */}
      </div>

      {/* Top Students Table */}
      <div className="kit-card">
        <div
          style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}
        >
          <h6 style={{ margin: 0, fontWeight: 700, color: "#1a202c" }}>
            🏆 Top Students (by Average Score)
          </h6>
        </div>

        {data.top_students.length === 0 ? (
          <Empty text="No test data yet. Students need to attempt tests first." />
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>College</th>
                  <th>Branch</th>
                  <th style={{ textAlign: "center" }}>Tests Taken</th>
                  <th>Avg Score</th>
                  <th>Best Score</th>
                </tr>
              </thead>
              <tbody>
                {data.top_students.map((s, i) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const rank = medals[i] || `${i + 1}`;
                  const avg = s.avg_score ? Number(s.avg_score).toFixed(1) : 0;
                  const best = s.best_score
                    ? Number(s.best_score).toFixed(1)
                    : 0;
                  const avgColor =
                    avg >= 70 ? "green" : avg >= 40 ? "yellow" : "red";

                  return (
                    <tr key={i}>
                      <td style={{ fontSize: "1.25rem" }}>{rank}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                          }}
                        >
                          <div
                            className="avatar"
                            style={{
                              width: 28,
                              height: 28,
                              fontSize: "0.75rem",
                            }}
                          >
                            {s.full_name[0]}
                          </div>
                          <span style={{ fontWeight: 600 }}>{s.full_name}</span>
                        </div>
                      </td>
                      <td style={{ color: "#718096" }}>{s.college || "—"}</td>
                      <td>
                        <Badge label={s.branch || "—"} color="blue" />
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 600 }}>
                        {s.tests_taken || 0}
                      </td>
                      <td>
                        <Badge label={`${avg}%`} color={avgColor} />
                      </td>
                      <td>
                        <Badge label={`${best}%`} color="green" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Score Trend (last 30 days) */}
      {data.scores_trend && data.scores_trend.length > 0 && (
        <div className="kit-card" style={{ marginTop: 24, padding: 20 }}>
          <h6 style={{ fontWeight: 700, color: "#1a202c", marginBottom: 16 }}>
            📈 Daily Average Score Trend
          </h6>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Average Score</th>
                  <th style={{ width: "60%" }}>Visual</th>
                </tr>
              </thead>
              <tbody>
                {data.scores_trend.map((row, i) => {
                  const score = Number(row.avg_score).toFixed(1);
                  const barColor =
                    score >= 70
                      ? "#38a169"
                      : score >= 40
                        ? "#d69e2e"
                        : "#e53e3e";
                  return (
                    <tr key={i}>
                      <td style={{ color: "#718096", fontSize: "0.82rem" }}>
                        {new Date(row.date).toLocaleDateString()}
                      </td>
                      <td>
                        <Badge
                          label={`${score}%`}
                          color={
                            score >= 70
                              ? "green"
                              : score >= 40
                                ? "yellow"
                                : "red"
                          }
                        />
                      </td>
                      <td>
                        <div
                          style={{
                            background: "#e2e8f0",
                            borderRadius: 100,
                            height: 8,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${score}%`,
                              height: "100%",
                              background: barColor,
                              borderRadius: 100,
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsPanel;