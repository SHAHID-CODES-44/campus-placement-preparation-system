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
import "../admin/AdminDashboard.css";

function NotificationsPanel({ role, userId }) {
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
    if (!form.title || !form.message) {
      alert("Title and message are required.");
      return;
    }
    await api("/notifications", "POST", { ...form, created_by: 1 });
    setModal(false);
    setForm({ target: "all" });
    load();
  };

  const del = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    await api(`/notifications/${id}`, "DELETE");
    load();
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="page-title">Notifications</div>
          <div className="page-subtitle">
            {items.length} notification{items.length !== 1 ? "s" : ""}
          </div>
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
      ) : items.length === 0 ? (
        <Empty text="No notifications yet." />
      ) : (
        <div>
          {items.map((n) => (
            <div key={n.id} className="notif-card">
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>🔔</span>
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
                  🗑 Delete
                </Btn>
              )}
            </div>
          ))}
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
            placeholder="Notification title"
          />
          <FTextarea
            label="Message *"
            rows={4}
            value={form.message || ""}
            onChange={(e) => upd("message", e.target.value)}
            placeholder="Write your notification message..."
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
              placeholder="Enter student ID"
            />
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn color="gray" onClick={() => setModal(false)}>
              Cancel
            </Btn>
            <Btn color="blue" onClick={save}>
              Send Notification
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default NotificationsPanel;
