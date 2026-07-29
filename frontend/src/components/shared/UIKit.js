import "./UIKit.css";

/* ── MODAL ──────────────────────────────────────── */
export function Modal({ show, title, onClose, children, wide = false }) {
  if (!show) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal-box ${wide ? "modal-wide" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h5 className="modal-title-text">{title}</h5>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ── BADGE ──────────────────────────────────────── */
export function Badge({ label, color = "blue" }) {
  return <span className={`badge-pill badge-${color}`}>{label}</span>;
}

/* ── DIFF BADGE ─────────────────────────────────── */
export function DiffBadge({ d }) {
  const map = { easy: "green", medium: "yellow", hard: "red" };
  return <Badge label={d} color={map[d] || "gray"} />;
}

/* ── STAT CARD ──────────────────────────────────── */
export function StatCard({ icon, label, value, color = "blue" }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

/* ── FORM HELPERS ───────────────────────────────── */
export function FormGroup({ label, children }) {
  return (
    <div className="fg-wrap">
      {label && <label className="fg-label">{label}</label>}
      {children}
    </div>
  );
}

export function FInput({ label, ...props }) {
  return (
    <div className="fg-wrap">
      {label && <label className="fg-label">{label}</label>}
      <input className="fg-input" {...props} />
    </div>
  );
}

export function FSelect({ label, children, ...props }) {
  return (
    <div className="fg-wrap">
      {label && <label className="fg-label">{label}</label>}
      <select className="fg-input" {...props}>
        {children}
      </select>
    </div>
  );
}

export function FTextarea({ label, ...props }) {
  return (
    <div className="fg-wrap">
      {label && <label className="fg-label">{label}</label>}
      <textarea className="fg-input fg-textarea" rows={4} {...props} />
    </div>
  );
}

/* ── BUTTONS ────────────────────────────────────── */
export function Btn({
  children,
  onClick,
  color = "blue",
  outline = false,
  sm = false,
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`kit-btn ${outline ? `kit-btn-outline-${color}` : `kit-btn-${color}`} ${sm ? "kit-btn-sm" : ""}`}
    >
      {children}
    </button>
  );
}

/* ── CARD ───────────────────────────────────────── */
export function Card({ children, className = "" }) {
  return <div className={`kit-card ${className}`}>{children}</div>;
}

/* ── TOAST ──────────────────────────────────────── */
export function Toast({ msg, type = "success", onClose }) {
  return (
    <div className={`toast-bar toast-${type}`}>
      <span>
        {type === "error" ? "❌" : "✅"} {msg}
      </span>
      <button onClick={onClose}>✕</button>
    </div>
  );
}

/* ── EMPTY STATE ────────────────────────────────── */
export function Empty({ text = "No data found." }) {
  return (
    <div className="empty-state">
      <span>🗂️</span>
      <p>{text}</p>
    </div>
  );
}

/* ── LOADER ─────────────────────────────────────── */
export function Loader() {
  return (
    <div className="loader-wrap">
      <div className="loader-spin"></div>
      <p>Loading...</p>
    </div>
  );
}
