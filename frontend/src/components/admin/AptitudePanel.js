import { useState, useEffect } from "react";
import api from "../../api";
import {
  Modal,
  Btn,
  Badge,
  DiffBadge,
  FInput,
  FSelect,
  FTextarea,
  Empty,
  Loader,
} from "../shared/UIKit";
import "./AdminDashboard.css";

function AptitudePanel({ role }) {
  const [questions, setQuestions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ difficulty: "", topic: "" });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const load = async () => {
    setLoading(true);
    const q = new URLSearchParams({ ...filter, limit: 100 }).toString();
    const r = await api(`/api/aptitude?${q}`);
    if (r.status === "success") setQuestions(r.data);
    setLoading(false);
  };

  useEffect(() => {
    api("/api/companies").then(
      (r) => r.status === "success" && setCompanies(r.data),
    );
    api("/api/aptitude/topics").then(
      (r) => r.status === "success" && setTopics(r.data),
    );
  }, []);

  useEffect(() => {
    load();
  }, [filter]);

  const save = async () => {
    if (form.id) await api(`/api/aptitude/${form.id}`, "PUT", form);
    else await api("/api/aptitude", "POST", { ...form, created_by: 1 });
    setModal(false);
    setForm({});
    load();
  };

  const del = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    await api(`/api/aptitude/${id}`, "DELETE");
    load();
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="page-title">Aptitude Questions</div>
          <div className="page-subtitle">
            {questions.length} questions loaded
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select
            style={{
              padding: "9px 12px",
              border: "1.5px solid #e2e8f0",
              borderRadius: 8,
              fontSize: "0.85rem",
              outline: "none",
            }}
            value={filter.difficulty}
            onChange={(e) =>
              setFilter((f) => ({ ...f, difficulty: e.target.value }))
            }
          >
            <option value="">All Difficulties</option>
            {["easy", "medium", "hard"].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            style={{
              padding: "9px 12px",
              border: "1.5px solid #e2e8f0",
              borderRadius: 8,
              fontSize: "0.85rem",
              outline: "none",
            }}
            value={filter.topic}
            onChange={(e) =>
              setFilter((f) => ({ ...f, topic: e.target.value }))
            }
          >
            <option value="">All Topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {role === "admin" && (
            <Btn
              onClick={() => {
                setForm({});
                setModal(true);
              }}
            >
              + Add Question
            </Btn>
          )}
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div>
          {questions.map((q, i) => (
            <div key={q.id} className="q-card">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div className="q-meta">
                    <span className="q-num">Q{i + 1}</span>
                    <DiffBadge d={q.difficulty} />
                    {q.topic && <Badge label={q.topic} color="blue" />}
                    {q.company_name && (
                      <Badge label={q.company_name} color="gray" />
                    )}
                  </div>
                  <div className="q-text">{q.question}</div>
                  <div className="options-grid">
                    {["A", "B", "C", "D"].map((opt) => (
                      <div
                        key={opt}
                        className={`option-item ${q.correct_option === opt ? "correct" : ""}`}
                      >
                        <span className="option-letter">{opt}</span>
                        {q[`option_${opt.toLowerCase()}`]}
                        {q.correct_option === opt && " ✓"}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="explanation">💡 {q.explanation}</div>
                  )}
                </div>
                {role === "admin" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      flexShrink: 0,
                    }}
                  >
                    <Btn
                      sm
                      color="gray"
                      onClick={() => {
                        setForm(q);
                        setModal(true);
                      }}
                    >
                      ✏️
                    </Btn>
                    <Btn sm color="red" outline onClick={() => del(q.id)}>
                      🗑
                    </Btn>
                  </div>
                )}
              </div>
            </div>
          ))}
          {questions.length === 0 && <Empty text="No questions found." />}
        </div>
      )}

      {role === "admin" && (
        <Modal
          show={modal}
          title={form.id ? "Edit Question" : "Add Aptitude Question"}
          onClose={() => setModal(false)}
          wide
        >
          <FTextarea
            label="Question *"
            rows={3}
            value={form.question || ""}
            onChange={(e) => upd("question", e.target.value)}
          />
          <div className="grid-2">
            <FInput
              label="Option A *"
              value={form.option_a || ""}
              onChange={(e) => upd("option_a", e.target.value)}
            />
            <FInput
              label="Option B *"
              value={form.option_b || ""}
              onChange={(e) => upd("option_b", e.target.value)}
            />
            <FInput
              label="Option C *"
              value={form.option_c || ""}
              onChange={(e) => upd("option_c", e.target.value)}
            />
            <FInput
              label="Option D *"
              value={form.option_d || ""}
              onChange={(e) => upd("option_d", e.target.value)}
            />
          </div>
          <div className="grid-3">
            <FSelect
              label="Correct Option *"
              value={form.correct_option || ""}
              onChange={(e) => upd("correct_option", e.target.value)}
            >
              <option value="">Select...</option>
              {["A", "B", "C", "D"].map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </FSelect>
            <FSelect
              label="Difficulty"
              value={form.difficulty || "medium"}
              onChange={(e) => upd("difficulty", e.target.value)}
            >
              {["easy", "medium", "hard"].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </FSelect>
            <FSelect
              label="Company"
              value={form.company_id || ""}
              onChange={(e) => upd("company_id", e.target.value || null)}
            >
              <option value="">None</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </FSelect>
          </div>
          <FInput
            label="Topic"
            value={form.topic || ""}
            onChange={(e) => upd("topic", e.target.value)}
            placeholder="Percentages, Time & Work..."
          />
          <FTextarea
            label="Explanation"
            rows={2}
            value={form.explanation || ""}
            onChange={(e) => upd("explanation", e.target.value)}
          />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn color="gray" onClick={() => setModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={save}>Save Question</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AptitudePanel;
