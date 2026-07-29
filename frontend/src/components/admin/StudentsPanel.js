import { useState, useEffect } from "react";
import api from "../../api";
import { Btn, Badge, Empty, Loader } from "../shared/UIKit";
import "./AdminDashboard.css";

function StudentsPanel() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const r = await api("/api/students");
    if (r.status === "success") setStudents(r.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    await api(`/api/students/${id}`, "DELETE");
    load();
  };

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.college || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="page-title">Students</div>
          <div className="page-subtitle">
            {students.length} registered students
          </div>
        </div>
        <input
          className="filter-bar"
          style={{
            padding: "9px 14px",
            border: "1.5px solid #e2e8f0",
            borderRadius: 8,
            fontSize: "0.88rem",
            outline: "none",
            width: 240,
          }}
          placeholder="🔍 Search by name, email, college..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="kit-card">
        {loading ? (
          <Loader />
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>College</th>
                  <th>Branch</th>
                  <th>Grad Year</th>
                  <th>Registered</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color: "#a0aec0" }}>{i + 1}</td>
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
                          style={{ width: 28, height: 28, fontSize: "0.75rem" }}
                        >
                          {s.full_name[0]}
                        </div>
                        <span style={{ fontWeight: 600 }}>{s.full_name}</span>
                      </div>
                    </td>
                    <td style={{ color: "#718096" }}>{s.email}</td>
                    <td style={{ color: "#718096" }}>{s.college || "—"}</td>
                    <td>
                      <Badge label={s.branch || "—"} color="blue" />
                    </td>
                    <td style={{ color: "#718096" }}>
                      {s.graduation_year || "—"}
                    </td>
                    <td style={{ color: "#a0aec0", fontSize: "0.78rem" }}>
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <Btn color="red" outline sm onClick={() => del(s.id)}>
                        🗑 Delete
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <Empty text="No students found." />}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentsPanel;
