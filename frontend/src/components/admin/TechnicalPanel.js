// ─── TechnicalPanel.js ─────────────────────────────────────────────────────
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

export function TechnicalPanel({ role }) {
  const [questions, setQuestions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ topic: "", difficulty: "" });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [expanded, setExpanded] = useState(null);

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const load = async () => {
    setLoading(true);
    const q = new URLSearchParams(filter).toString();
    const r = await api(`/api/technical?${q}`);
    if (r.status === "success") setQuestions(r.data);
    setLoading(false);
  };

  useEffect(() => {
    api("/api/companies").then(
      (r) => r.status === "success" && setCompanies(r.data),
    );
    api("/api/technical/topics").then(
      (r) => r.status === "success" && setTopics(r.data),
    );
  }, []);
  useEffect(() => {
    load();
  }, [filter]);

  const save = async () => {
    if (form.id) await api(`/api/technical/${form.id}`, "PUT", form);
    else await api("/api/technical", "POST", { ...form, created_by: 1 });
    setModal(false);
    setForm({});
    load();
  };
  const del = async (id) => {
    if (!window.confirm("Delete?")) return;
    await api(`/api/technical/${id}`, "DELETE");
    load();
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="page-title">Technical Questions</div>
          <div className="page-subtitle">{questions.length} questions</div>
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
                    <Badge label={q.topic} color="purple" />
                    {q.subtopic && <Badge label={q.subtopic} color="blue" />}
                    <DiffBadge d={q.difficulty} />
                    {q.company_name && (
                      <Badge label={q.company_name} color="gray" />
                    )}
                  </div>
                  <div className="q-text">{q.question}</div>
                  {expanded === q.id ? (
                    <>
                      <div className="answer-box">{q.answer}</div>
                      <Btn
                        sm
                        color="gray"
                        onClick={() => setExpanded(null)}
                        style={{ marginTop: 8 }}
                      >
                        Hide Answer
                      </Btn>
                    </>
                  ) : (
                    <Btn
                      sm
                      color="blue"
                      outline
                      onClick={() => setExpanded(q.id)}
                    >
                      👁 View Answer
                    </Btn>
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
          title={form.id ? "Edit Technical Q" : "Add Technical Question"}
          onClose={() => setModal(false)}
          wide
        >
          <FTextarea
            label="Question *"
            rows={3}
            value={form.question || ""}
            onChange={(e) => upd("question", e.target.value)}
          />
          <FTextarea
            label="Answer *"
            rows={6}
            value={form.answer || ""}
            onChange={(e) => upd("answer", e.target.value)}
          />
          <div className="grid-2">
            <FInput
              label="Topic *"
              value={form.topic || ""}
              onChange={(e) => upd("topic", e.target.value)}
              placeholder="Data Structures, OS..."
            />
            <FInput
              label="Subtopic"
              value={form.subtopic || ""}
              onChange={(e) => upd("subtopic", e.target.value)}
              placeholder="Arrays, Sorting..."
            />
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
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn color="gray" onClick={() => setModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default TechnicalPanel;
