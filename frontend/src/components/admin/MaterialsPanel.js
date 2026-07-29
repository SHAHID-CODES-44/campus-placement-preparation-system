import { useState, useEffect } from "react";
import api from "../../api";
import {
  Modal,
  Btn,
  Badge,
  FInput,
  FSelect,
  FTextarea,
  Loader,
} from "../shared/UIKit";
import "./AdminDashboard.css";

const CAT_COLORS = {
  aptitude: "blue",
  technical: "purple",
  hr: "green",
  resume: "pink",
};

function MaterialsPanel({ role }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: "", company_id: "" });
  const [modal, setModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null); // State for the file upload

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

 const load = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams(filter).toString();
      const r = await api(`/api/study-materials?${q}`);
      if (r.status === "success") setItems(r.data);
    } catch (err) {
      console.error("API Error:", err);
      alert("Backend is not responding! Check your Flask terminal.");
    } finally {
      // This line runs NO MATTER WHAT (success or failure)
      setLoading(false); 
    }
  };

  useEffect(() => { 
        load(); 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // This empty array means "only run once when the page loads"
   
   useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]); // This means "run every time the category or company filter changes"
    
  const save = async () => {
    // 1. Validation: Don't let them save without a file or title
    if (!file || !form.title || !form.category) {
      alert("Please provide a Title, Category, and select a File!");
      return;
    }

    // 2. Prepare the data "package"
    const formData = new FormData();
    formData.append("file", file); // Must match 'file' in Flask
    formData.append("title", form.title);
    formData.append("category", form.category);
    formData.append("content", form.content || "");
    formData.append("company_id", form.company_id || "");
    formData.append("created_by", 1);

    try {
      // 3. Send to backend
      const resp = await fetch("http://127.0.0.1:5000/api/study-materials", {
        method: "POST",
        body: formData, // Sending FormData (No headers needed!)
      });

      const r = await resp.json();

      if (r.status === "success") {
        alert("Material Saved Successfully!");
        setModal(false); // Close the popup
        setForm({});    // Clear the form
        setFile(null);  // Clear the file
        load();         // Refresh the list on the page
      } else {
        alert("Error: " + r.message);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Could not connect to backend. Is Flask running?");
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    await api(`/api/study-materials/${id}`, "DELETE");
    load();
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="page-title">Study Materials</div>
          <div className="page-subtitle">
            {items.length} materials available
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select
            className="filter-bar"
            value={filter.category}
            onChange={(e) =>
              setFilter((f) => ({ ...f, category: e.target.value }))
            }
          >
            <option value="">All Categories</option>
            {["aptitude", "technical", "hr", "resume"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {role === "admin" && (
            <Btn
              onClick={() => {
                setForm({});
                setFile(null);
                setModal(true);
              }}
            >
              + Add Material
            </Btn>
          )}
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid-3">
          {items.map((item) => (
            <div key={item.id} className="mat-card">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Badge
                  label={item.category}
                  color={CAT_COLORS[item.category] || "gray"}
                />
                {item.company_name && (
                  <Badge label={item.company_name} color="gray" />
                )}
              </div>
              <div className="mat-title">{item.title}</div>
              <div className="mat-content">{item.content}</div>
              <div className="mat-actions">
                <Btn sm color="blue" outline onClick={() => setViewModal(item)}>
                  👁 Read
                </Btn>
                
                {/* Download Button for Files */}
                {item.file_url && (
                  <a 
                    href={`http://127.0.0.1:5000/api/study-materials/download/${item.file_url}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <Btn sm color="green" outline>📥 Download</Btn>
                  </a>
                )}

                {role === "admin" && (
                  <>
                    <Btn
                      sm
                      color="gray"
                      onClick={() => {
                        setForm(item);
                        setModal(true);
                      }}
                    >
                      ✏️
                    </Btn>
                    <Btn sm color="red" outline onClick={() => del(item.id)}>
                      🗑
                    </Btn>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {role === "admin" && (
        <Modal
          show={modal}
          title={form.id ? "Edit Material" : "Add Study Material"}
          onClose={() => setModal(false)}
          wide
        >
          <FInput
            label="Title *"
            value={form.title || ""}
            onChange={(e) => upd("title", e.target.value)}
          />
          <div className="grid-2">
            <FSelect
              label="Category *"
              value={form.category || ""}
              onChange={(e) => upd("category", e.target.value)}
            >
              <option value="">Select...</option>
              {["aptitude", "technical", "hr", "resume"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </FSelect>
            
            {/* FILE INPUT FIELD */}
            <div className="f-group">
                <label className="f-label">Upload File (PDF/Image)</label>
                <input 
                    type="file" 
                    className="filter-bar" 
                    style={{ width: '100%', border: '1px solid #ddd' }}
                    onChange={(e) => setFile(e.target.files[0])} 
                />
            </div>
          </div>
          <FTextarea
            label="Short Description *"
            rows={4}
            value={form.content || ""}
            onChange={(e) => upd("content", e.target.value)}
          />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <Btn color="gray" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={save}>Save Material</Btn>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {/* View Modal */}
      <Modal 
        show={!!viewModal} 
        title={viewModal?.title || "Material Details"} 
        onClose={() => setViewModal(null)} 
        wide
      >
        {viewModal && (
          <div>
            {/* Display the text description first */}
            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#64748b', marginBottom: '5px' }}>Description:</h4>
                <div className="answer-box" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                    {viewModal.content}
                </div>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />

            {/* Display the actual file */}
            {viewModal.file_url ? (
              <div>
                <h4 style={{ color: '#64748b', marginBottom: '10px' }}>Uploaded File:</h4>
                
                {/* We use an iframe to show the PDF or Image inside the modal */}
                <div style={{ width: '100%', height: '500px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <iframe
                        src={`http://127.0.0.1:5000/api/study-materials/download/${viewModal.file_url}`}
                        title="Material File"
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                    />
                </div>
                
                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                    <a 
                        href={`http://127.0.0.1:5000/api/study-materials/download/${viewModal.file_url}`} 
                        target="_blank" 
                        rel="noreferrer"
                    >
                        <Btn sm color="blue">Open in New Tab ↗</Btn>
                    </a>
                </div>
              </div>
            ) : (
              <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No file attached to this material.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MaterialsPanel;