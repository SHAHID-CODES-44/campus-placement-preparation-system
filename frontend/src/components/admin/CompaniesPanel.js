import { useState, useEffect } from "react";
import api from "../../api";
import {
  Modal,
  Btn,
  Badge,
  FInput,
  FTextarea,
  FSelect,
  Empty,
  Loader,
} from "../shared/UIKit";
import "./AdminDashboard.css";

const RECRUITMENT_URLS = {
  "TCS":        "https://www.tcs.com/careers",
  "Infosys":    "https://www.infosys.com/careers",
  "Wipro":      "https://careers.wipro.com",
  "Cognizant":  "https://careers.cognizant.com",
  "Accenture":  "https://www.accenture.com/in-en/careers",
  "Amazon":     "https://www.amazon.jobs",
  "Google":     "https://careers.google.com",
};

//  CompaniesPanel function :
export function CompaniesPanel({ role }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const load = async () => {
    setLoading(true);
    const r = await api("/api/companies");
    if (r.status === "success") setCompanies(r.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (form.id) await api(`/api/companies/${form.id}`, "PUT", form);
    else await api("/api/companies", "POST", form);
    setModal(false);
    setForm({});
    load();
  };

  const del = async (id) => {
    if (!window.confirm("Delete company?")) return;
    await api(`/api/companies/${id}`, "DELETE");
    load();
  };

  const handleCardClick = (c) => {
    if (role !== "student") return;
    const url = RECRUITMENT_URLS[c.name] 
      || `https://www.google.com/search?q=${encodeURIComponent(c.name + " careers recruitment")}`;
    window.open(url, "_blank");
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="page-title">Companies</div>
          <div className="page-subtitle">{companies.length} companies</div>
        </div>
        {role === "admin" && (
          <Btn onClick={() => { setForm({}); setModal(true); }}>
            + Add Company
          </Btn>
        )}
      </div>

      {/* Student tip banner */}
      {role === "student" && (
        <div style={{
          background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10,
          padding: "10px 16px", marginBottom: 20, fontSize: 13,
          color: "#1D4ED8", display: "flex", alignItems: "center", gap: 8,
        }}>
          💡 Click on any company card to open their official careers / recruitment page.
        </div>
      )}

      {loading ? (
        <Loader />
      ) : (
        <div className="grid-3">
          {companies.map((c) => (
            <div
              key={c.id}
              className="company-card"
              onClick={() => handleCardClick(c)}
              style={{
                cursor: role === "student" ? "pointer" : "default",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={e => {
                if (role === "student") {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=3182ce&color=fff&size=80`}
                alt={c.name}
                className="company-logo"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=3182ce&color=fff&size=80`;
                }}
              />
              <div className="company-name">{c.name}</div>
              <div style={{ marginBottom: 8 }}>
                <Badge label={c.sector || "IT"} color="blue" />
              </div>
              <div className="company-desc">{c.description}</div>

              {/* Student: show "Visit Careers" link */}
              {role === "student" && (
                <div style={{
                  marginTop: 10, fontSize: 12, color: "#3B82F6",
                  fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
                }}>
                  🔗 Visit Careers Page →
                </div>
              )}

              {/* Admin: show Edit/Delete */}
              {role === "admin" && (
                <div className="company-actions">
                  <Btn sm color="gray" onClick={(e) => {
                    e.stopPropagation();
                    setForm(c);
                    setModal(true);
                  }}>✏️ Edit</Btn>
                  <Btn sm color="red" outline onClick={(e) => {
                    e.stopPropagation();
                    del(c.id);
                  }}>🗑</Btn>
                </div>
              )}
            </div>
          ))}
          {companies.length === 0 && (
            <div style={{ gridColumn: "1/-1" }}>
              <Empty text="No companies yet." />
            </div>
          )}
        </div>
      )}

      {role === "admin" && (
        <Modal show={modal} title={form.id ? "Edit Company" : "Add Company"} onClose={() => setModal(false)}>
          <FInput label="Company Name *" value={form.name || ""}
            onChange={(e) => upd("name", e.target.value)} />
          <FInput label="Logo URL" placeholder="https://logo.clearbit.com/..."
            value={form.logo_url || ""} onChange={(e) => upd("logo_url", e.target.value)} />
          <FInput label="Sector" placeholder="IT Services / Product / Consulting"
            value={form.sector || ""} onChange={(e) => upd("sector", e.target.value)} />
          <FTextarea label="Description" value={form.description || ""}
            onChange={(e) => upd("description", e.target.value)} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn color="gray" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
// ─── NOTIFICATIONS PANEL ──────────────────────────────────────────────────────
export function NotificationsPanel({ role, userId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ target: "all" });
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const load = async () => {
    setLoading(true);
    const q = role === "student" ? `?student_id=${userId}` : "";
    const r = await api(`/api/notifications${q}`);
    if (r.status === "success") setItems(r.data);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    await api("/api/notifications", "POST", { ...form, created_by: 1 });
    setModal(false);
    setForm({ target: "all" });
    load();
  };
  const del = async (id) => {
    await api(`/api/notifications/${id}`, "DELETE");
    load();
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="page-title">Notifications</div>
          <div className="page-subtitle">{items.length} notifications</div>
        </div>
        {role === "admin" && (
          <Btn
            onClick={() => {
              setForm({ target: "all" });
              setModal(true);
            }}
          >
            + Send Notification
          </Btn>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div>
          {items.map((n) => (
            <div key={n.id} className="notif-card">
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span>🔔</span>
                  <div className="notif-title">{n.title}</div>
                  <Badge
                    label={n.target === "all" ? "All Students" : "Specific"}
                    color={n.target === "all" ? "blue" : "purple"}
                  />
                </div>
                <div className="notif-msg">{n.message}</div>
                <div className="notif-meta">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
              {role === "admin" && (
                <Btn sm color="red" outline onClick={() => del(n.id)}>
                  🗑
                </Btn>
              )}
            </div>
          ))}
          {items.length === 0 && <Empty text="No notifications." />}
        </div>
      )}

      {role === "admin" && (
        <Modal
          show={modal}
          title="Send Notification"
          onClose={() => setModal(false)}
        >
          <FInput
            label="Title *"
            value={form.title || ""}
            onChange={(e) => upd("title", e.target.value)}
          />
          <FTextarea
            label="Message *"
            rows={4}
            value={form.message || ""}
            onChange={(e) => upd("message", e.target.value)}
          />
          <FSelect
            label="Target"
            value={form.target}
            onChange={(e) => upd("target", e.target.value)}
          >
            <option value="all">All Students</option>
            <option value="specific">Specific Student</option>
          </FSelect>
          {form.target === "specific" && (
            <FInput
              label="Student ID"
              type="number"
              value={form.student_id || ""}
              onChange={(e) => upd("student_id", e.target.value)}
            />
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn color="gray" onClick={() => setModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={save}>Send</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── REPORTS PANEL ────────────────────────────────────────────────────────────
export function ReportsPanel() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api("/api/reports/overall").then(
      (r) => r.status === "success" && setData(r.data),
    );
  }, []);
  if (!data) return <Loader />;

  return (
    <div>
      <div className="page-title">Overall Reports</div>
      <div className="page-subtitle">Platform-wide performance summary</div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="kit-card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 4 }}>🧮</div>
          <div
            style={{ fontSize: "1.8rem", fontWeight: 800, color: "#2b6cb0" }}
          >
            {data.question_stats.aptitude}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#718096" }}>
            Aptitude Questions
          </div>
        </div>
        <div className="kit-card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 4 }}>💻</div>
          <div
            style={{ fontSize: "1.8rem", fontWeight: 800, color: "#805ad5" }}
          >
            {data.question_stats.technical}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#718096" }}>
            Technical Questions
          </div>
        </div>
        <div className="kit-card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 4 }}>⭐</div>
          <div
            style={{ fontSize: "1.8rem", fontWeight: 800, color: "#c05621" }}
          >
            {data.question_stats.coding}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#718096" }}>
            Coding Challenges
          </div>
        </div>
      </div>

      <div className="kit-card" style={{ padding: 20 }}>
        <h6 style={{ fontWeight: 700, color: "#1a202c", marginBottom: 16 }}>
          🏆 Top Students (by Average Score)
        </h6>
        {data.top_students.length === 0 ? (
          <Empty text="No test data yet." />
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>College</th>
                  <th>Branch</th>
                  <th>Tests</th>
                  <th>Avg Score</th>
                  <th>Best Score</th>
                </tr>
              </thead>
              <tbody>
                {data.top_students.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: "1.2rem" }}>
                      {
                        ["🥇", "🥈", "🥉", "4", "5", "6", "7", "8", "9", "10"][
                          i
                        ]
                      }
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.full_name}</td>
                    <td style={{ color: "#718096" }}>{s.college || "—"}</td>
                    <td>
                      <Badge label={s.branch || "—"} color="blue" />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {s.tests_taken || 0}
                    </td>
                    <td>
                      <Badge
                        label={`${s.avg_score ? Number(s.avg_score).toFixed(1) : 0}%`}
                        color={
                          s.avg_score > 70
                            ? "green"
                            : s.avg_score > 40
                              ? "yellow"
                              : "red"
                        }
                      />
                    </td>
                    <td>
                      <Badge
                        label={`${s.best_score ? Number(s.best_score).toFixed(1) : 0}%`}
                        color="green"
                      />
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

export default CompaniesPanel;
