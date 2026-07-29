import { useState, useEffect, useRef } from "react";
import api from "../../api";
import { Btn, DiffBadge, Badge, Loader } from "../shared/UIKit";
import "./StudentDashboard.css";
import "../admin/AdminDashboard.css";

/* ── CONFIG SCREEN ─────────────────────────────── */
function ConfigScreen({ onStart }) {
  const [settings, setSettings] = useState({
    count: 10,
    difficulty: "",
    topic: "",
  });
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    api("/api/aptitude/topics").then(
      (r) => r.status === "success" && setTopics(r.data),
    );
  }, []);

  return (
    <div>
      <div className="page-title">Aptitude Mock Test</div>
      <div className="page-subtitle">Configure your test before starting</div>
      <div className="test-config-card">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#4a5568",
                display: "block",
                marginBottom: 6,
              }}
            >
              Number of Questions
            </label>
            <select
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 8,
                fontSize: "0.9rem",
                outline: "none",
              }}
              value={settings.count}
              onChange={(e) =>
                setSettings((s) => ({ ...s, count: e.target.value }))
              }
            >
              {[5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>
                  {n} Questions
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#4a5568",
                display: "block",
                marginBottom: 6,
              }}
            >
              Difficulty
            </label>
            <select
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 8,
                fontSize: "0.9rem",
                outline: "none",
              }}
              value={settings.difficulty}
              onChange={(e) =>
                setSettings((s) => ({ ...s, difficulty: e.target.value }))
              }
            >
              <option value="">Any Difficulty</option>
              {["easy", "medium", "hard"].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#4a5568",
                display: "block",
                marginBottom: 6,
              }}
            >
              Topic
            </label>
            <select
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 8,
                fontSize: "0.9rem",
                outline: "none",
              }}
              value={settings.topic}
              onChange={(e) =>
                setSettings((s) => ({ ...s, topic: e.target.value }))
              }
            >
              <option value="">Any Topic</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <Btn onClick={() => onStart(settings)} color="blue">
            🚀 Start Test
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ── RESULT SCREEN ─────────────────────────────── */
function ResultScreen({ result, questions, answers, timer, onRetake }) {
  const { score, correct, wrong, total } = result;
  const circleClass =
    score >= 70
      ? "result-score-green"
      : score >= 40
        ? "result-score-yellow"
        : "result-score-red";
  const fmt = (s) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div>
      <div className="page-title">Test Results</div>

      <div className="kit-card" style={{ padding: 28, marginBottom: 20 }}>
        <div className={`result-score-circle ${circleClass}`}>
          <span className="score-pct">{score}%</span>
          <span className="score-lbl">Score</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              textAlign: "center",
              padding: "14px 24px",
              background: "#f0fff4",
              borderRadius: 12,
            }}
          >
            <div
              style={{ fontSize: "1.6rem", fontWeight: 800, color: "#276749" }}
            >
              {correct}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#718096" }}>Correct</div>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "14px 24px",
              background: "#fff5f5",
              borderRadius: 12,
            }}
          >
            <div
              style={{ fontSize: "1.6rem", fontWeight: 800, color: "#c53030" }}
            >
              {wrong}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#718096" }}>Wrong</div>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "14px 24px",
              background: "#f7fafc",
              borderRadius: 12,
            }}
          >
            <div
              style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1a202c" }}
            >
              {total}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#718096" }}>Total</div>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "14px 24px",
              background: "#f7fafc",
              borderRadius: 12,
            }}
          >
            <div
              style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1a202c" }}
            >
              {fmt(timer)}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#718096" }}>Time</div>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <Btn onClick={onRetake} color="blue">
            🔄 Take Another Test
          </Btn>
        </div>
      </div>

      {/* Review */}
      <h6
        style={{
          fontWeight: 700,
          color: "#1a202c",
          marginBottom: 12,
          fontSize: "1rem",
        }}
      >
        Question Review
      </h6>
      {questions.map((q, i) => {
        const sel = answers[q.id];
        const isRight = sel === q.correct_option;
        return (
          <div
            key={q.id}
            style={{
              background: "white",
              border: `1px solid ${isRight ? "#c6f6d5" : "#fed7d7"}`,
              borderRadius: 12,
              padding: "16px 18px",
              marginBottom: 10,
            }}
          >
            <div className="q-meta" style={{ marginBottom: 8 }}>
              <span className="q-num">Q{i + 1}</span>
              <DiffBadge d={q.difficulty} />
              {q.topic && <Badge label={q.topic} color="blue" />}
              <span style={{ marginLeft: "auto", fontSize: "1.2rem" }}>
                {isRight ? "✅" : "❌"}
              </span>
            </div>
            <div
              style={{
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "#1a202c",
                marginBottom: 10,
              }}
            >
              {q.question}
            </div>
            <div className="options-grid">
              {["A", "B", "C", "D"].map((opt) => {
                const isCorrect = q.correct_option === opt;
                const isSelected = sel === opt;
                let cls = "option-item";
                if (isCorrect) cls += " correct";
                return (
                  <div
                    key={opt}
                    className={cls}
                    style={{ opacity: !isCorrect && !isSelected ? 0.5 : 1 }}
                  >
                    <span className="option-letter">{opt}</span>
                    {q[`option_${opt.toLowerCase()}`]}
                    {isCorrect && " ✓"}
                    {isSelected && !isCorrect && " ✗"}
                  </div>
                );
              })}
            </div>
            {sel && !isRight && (
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "#c53030",
                  marginTop: 6,
                  background: "#fff5f5",
                  padding: "6px 10px",
                  borderRadius: 6,
                }}
              >
                Your answer: {sel}. {q[`option_${sel.toLowerCase()}`]}
              </div>
            )}
            {q.explanation && (
              <div className="explanation">💡 {q.explanation}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── MAIN TEST COMPONENT ───────────────────────── */
function AptitudeTest({ studentId }) {
  const [phase, setPhase] = useState("config"); // config | test | result
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timer, setTimer] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (phase === "test") {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const fmt = (s) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const startTest = async (settings) => {
    setLoading(true);
    const q = new URLSearchParams({
      limit: settings.count,
      difficulty: settings.difficulty,
      topic: settings.topic,
    }).toString();
    const r = await api(`/api/aptitude?${q}`);
    if (r.status === "success" && r.data.length > 0) {
      setQuestions(r.data);
      setAnswers({});
      setCurrent(0);
      setTimer(0);
      setPhase("test");
    } else {
      alert(
        "No questions available for selected filters. Try different settings.",
      );
    }
    setLoading(false);
  };

  const submitTest = async () => {
    if (
      !window.confirm(
        "Submit the test? You cannot change answers after submitting.",
      )
    )
      return;
    const ansArr = questions.map((q) => ({
      question_id: q.id,
      selected_option: answers[q.id] || null,
      correct_option: q.correct_option,
    }));
    const r = await api("/api/test/submit", "POST", {
      student_id: studentId,
      test_type: "aptitude",
      time_taken: timer,
      answers: ansArr,
    });
    if (r.status === "success") {
      setResult(r.data);
      setPhase("result");
    }
  };

  const retake = () => {
    setPhase("config");
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setTimer(0);
  };

  if (loading) return <Loader />;
  if (phase === "config") return <ConfigScreen onStart={startTest} />;
  if (phase === "result")
    return (
      <ResultScreen
        result={result}
        questions={questions}
        answers={answers}
        timer={timer}
        onRetake={retake}
      />
    );

  // ── TEST PHASE ──
  const q = questions[current];
  const answered = Object.keys(answers).length;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <div className="page-title">Aptitude Test</div>
          <div className="page-subtitle">
            {answered} of {questions.length} answered
          </div>
        </div>
        <Btn color="green" onClick={submitTest}>
          ✅ Submit Test
        </Btn>
      </div>

      {/* Progress */}
      <div className="prog-bar-wrap" style={{ marginBottom: 20 }}>
        <div
          className="prog-bar-fill"
          style={{ width: `${(answered / questions.length) * 100}%` }}
        />
      </div>

      <div className="test-page">
        {/* Question */}
        <div>
          <div className="kit-card" style={{ padding: 22 }}>
            <div className="q-meta" style={{ marginBottom: 12 }}>
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#3182ce",
                }}
              >
                Question {current + 1} / {questions.length}
              </span>
              <DiffBadge d={q.difficulty} />
              {q.topic && <Badge label={q.topic} color="blue" />}
            </div>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "#1a202c",
                marginBottom: 20,
                lineHeight: 1.6,
              }}
            >
              {q.question}
            </div>
            {["A", "B", "C", "D"].map((opt) => (
              <button
                key={opt}
                className={`option-btn ${answers[q.id] === opt ? "selected" : ""}`}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
              >
                <span className="opt-letter">{opt}</span>
                {q[`option_${opt.toLowerCase()}`]}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 14,
            }}
          >
            <Btn
              color="gray"
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
            >
              ← Previous
            </Btn>
            {current < questions.length - 1 ? (
              <Btn color="blue" onClick={() => setCurrent((c) => c + 1)}>
                Next →
              </Btn>
            ) : (
              <Btn color="green" onClick={submitTest}>
                Submit Test ✅
              </Btn>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="test-sidebar-card">
          <div className={`test-timer ${timer > 1800 ? "warning" : ""}`}>
            {fmt(timer)}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "#718096",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Time Elapsed
          </div>
          <div className="q-nav-grid">
            {questions.map((_, i) => (
              <button
                key={i}
                className={`q-nav-btn ${answers[questions[i].id] ? "answered" : ""} ${i === current ? "current" : ""}`}
                onClick={() => setCurrent(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "#718096",
              borderTop: "1px solid #e2e8f0",
              paddingTop: 10,
            }}
          >
            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  background: "#3182ce",
                  borderRadius: 3,
                  display: "inline-block",
                }}
              ></span>
              Answered ({answered})
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  background: "#e2e8f0",
                  borderRadius: 3,
                  display: "inline-block",
                }}
              ></span>
              Not Answered ({questions.length - answered})
            </div>
          </div>
          <Btn
            color="green"
            onClick={submitTest}
            style={{ width: "100%", marginTop: 14, justifyContent: "center" }}
          >
            Submit
          </Btn>
        </div>
      </div>
    </div>
  );
}

export default AptitudeTest;
