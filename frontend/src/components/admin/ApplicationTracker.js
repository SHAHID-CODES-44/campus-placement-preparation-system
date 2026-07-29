import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';

const STAGES = ["Applied", "Aptitude", "GD", "Technical", "HR", "Offer"];

const STAGE_META = {
  "Applied":   { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", icon: "📝" },
  "Aptitude":  { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA", icon: "🧮" },
  "GD":        { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A", icon: "🗣️" },
  "Technical": { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE", icon: "💻" },
  "HR":        { bg: "#FDF2F8", text: "#9D174D", border: "#FBCFE8", icon: "🤝" },
  "Offer":     { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0", icon: "🎉" },
};

const STATUS_META = {
  "Active":   { bg: "#DBEAFE", text: "#1E40AF" },
  "Rejected": { bg: "#FEE2E2", text: "#991B1B" },
  "Selected": { bg: "#D1FAE5", text: "#065F46" },
};

const EMPTY_FORM = {
  company_name: '', job_role: '', location: '',
  package: '', current_stage: 'Applied',
  date_applied: new Date().toISOString().split('T')[0],
};

// ── SHARED COMPONENTS ────────────────────────────────────────────────────────

function StagePill({ stage }) {
  const m = STAGE_META[stage] || {};
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: m.bg, color: m.text, border: `1px solid ${m.border}`,
      whiteSpace: 'nowrap',
    }}>{m.icon} {stage}</span>
  );
}

function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META['Active'];
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 11,
      fontWeight: 700, background: m.bg, color: m.text,
    }}>{status || 'Active'}</span>
  );
}

function StagePipeline({ current }) {
  const idx = STAGES.indexOf(current);
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, flexWrap: 'nowrap', overflowX: 'auto' }}>
      {STAGES.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        const m = STAGE_META[s];
        return (
          <React.Fragment key={s}>
            <div style={{
              padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600,
              whiteSpace: 'nowrap', flexShrink: 0,
              background: active ? m.bg : done ? '#F0FDF4' : '#F8FAFC',
              color: active ? m.text : done ? '#16A34A' : '#CBD5E1',
              border: `1px solid ${active ? m.border : done ? '#BBF7D0' : '#E2E8F0'}`,
            }}>{done ? '✓ ' : ''}{s}</div>
            {i < STAGES.length - 1 && (
              <div style={{ width: 14, height: 1.5, background: i < idx ? '#16A34A' : '#E2E8F0', flexShrink: 0 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0',
  borderRadius: 8, fontSize: 14, color: '#0F172A', outline: 'none',
  background: '#FAFAFA', boxSizing: 'border-box',
};

function Field({ label, children, col }) {
  return (
    <div style={{ gridColumn: col || 'auto' }}>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B',
        marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>{label}</label>
      {children}
    </div>
  );
}

function Modal({ show, title, onClose, children }) {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(3px)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 18, padding: 28, width: '100%',
        maxWidth: 540, boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
        maxHeight: '92vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{title}</div>
          <button onClick={onClose} style={{
            background: '#F1F5F9', border: 'none', borderRadius: 8,
            width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#64748B',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── STUDENT FORM ─────────────────────────────────────────────────────────────

function AddApplicationForm({ user, onSuccess, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.company_name.trim()) { setError('Company name is required.'); return; }
    if (!form.job_role.trim()) { setError('Job role is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const r = await api('/api/applications', 'POST', { ...form, student_id: user?.id });
      if (r.status === 'success') { onSuccess(); }
      else { setError(r.message || 'Failed to add. Try again.'); }
    } catch { setError('Cannot connect to server. Is Flask running?'); }
    setSaving(false);
  };

  return (
    <div>
      {/* Form intro */}
      <div style={{
        background: 'linear-gradient(135deg, #EFF6FF, #F5F3FF)',
        borderRadius: 12, padding: '14px 16px', marginBottom: 20,
        border: '1px solid #BFDBFE',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8', marginBottom: 3 }}>
          📋 New Application
        </div>
        <div style={{ fontSize: 12, color: '#3B82F6' }}>
          Fill in the details of the company you applied to. You can update the stage as you progress.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Company Name *" col="1 / -1">
          <input style={inputStyle} placeholder="e.g. TCS, Infosys, Google"
            value={form.company_name}
            onChange={e => set('company_name', e.target.value)} />
        </Field>

        <Field label="Job Role *" col="1 / -1">
          <input style={inputStyle} placeholder="e.g. Software Engineer, Data Analyst"
            value={form.job_role}
            onChange={e => set('job_role', e.target.value)} />
        </Field>

        <Field label="Location">
          <input style={inputStyle} placeholder="e.g. Bangalore, Remote"
            value={form.location}
            onChange={e => set('location', e.target.value)} />
        </Field>

        <Field label="Package / CTC">
          <input style={inputStyle} placeholder="e.g. 6 LPA, 12 LPA"
            value={form.package}
            onChange={e => set('package', e.target.value)} />
        </Field>

        <Field label="Date Applied">
          <input style={inputStyle} type="date"
            value={form.date_applied}
            onChange={e => set('date_applied', e.target.value)} />
        </Field>

        <Field label="Current Stage">
          <select style={inputStyle}
            value={form.current_stage}
            onChange={e => set('current_stage', e.target.value)}>
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      {error && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8,
          padding: '10px 14px', color: '#DC2626', fontSize: 13, marginTop: 14,
        }}>⚠️ {error}</div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
        <button onClick={onCancel} style={{
          padding: '9px 18px', borderRadius: 8, border: '1.5px solid #E2E8F0',
          background: '#fff', color: '#64748B', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>Cancel</button>
        <button onClick={handleSubmit} disabled={saving} style={{
          padding: '9px 22px', borderRadius: 8, border: 'none',
          background: saving ? '#93C5FD' : 'linear-gradient(135deg, #3B82F6, #6366F1)',
          color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
        }}>{saving ? 'Saving...' : '✓ Track Application'}</button>
      </div>
    </div>
  );
}

// ── STUDENT VIEW (Tabs: Active / Rejected / Selected) ─────────────────────
 function StudentView({ apps, onNextStage, onUpdateStatus, onOfferUpload }) {
  const [tab, setTab] = useState('Active');


  const counts = {
    Active: apps.filter(a => (a.status || 'Active') === 'Active').length,
    Rejected: apps.filter(a => a.status === 'Rejected').length,
    Selected: apps.filter(a => a.status === 'Selected').length,
  };

  const filtered = apps.filter(a => (a.status || 'Active') === tab);

  const TAB_STYLE = (t) => ({
    padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
    background: tab === t
      ? (t === 'Active' ? '#3B82F6' : t === 'Rejected' ? '#EF4444' : '#10B981')
      : '#F1F5F9',
    color: tab === t ? '#fff' : '#64748B',
  });

  return (
    <div>
      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['Active', 'Rejected', 'Selected'].map(t => (
          <button key={t} style={TAB_STYLE(t)} onClick={() => setTab(t)}>
            {t === 'Active' ? '🔵' : t === 'Rejected' ? '❌' : '🎉'} {t}
            <span style={{
              marginLeft: 6, background: 'rgba(255,255,255,0.25)',
              padding: '1px 7px', borderRadius: 10, fontSize: 11,
            }}>{counts[t]}</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(app => {
          const stageIdx = STAGES.indexOf(app.current_stage);
          const isOffer = app.current_stage === 'Offer';

          return (
            <div key={app.id} style={{
              background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0',
              padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}>

              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A' }}>{app.company_name}</div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 3 }}>
                    {app.job_role}
                    {app.location && <span style={{ color: '#94A3B8' }}> · 📍 {app.location}</span>}
                    {app.package && <span style={{ color: '#059669', fontWeight: 600 }}> · 💰 {app.package}</span>}
                  </div>
                </div>
                <StagePill stage={app.current_stage} />
              </div>

              {/* Pipeline */}
              <StagePipeline current={app.current_stage} />

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>
                  📅 Applied: {app.date_applied ? new Date(app.date_applied).toLocaleDateString('en-IN') : '—'}
                </div>
                {tab === 'Active' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => onUpdateStatus(app.id, 'Rejected')} style={{
                      padding: '6px 12px', borderRadius: 8, border: '1.5px solid #FCA5A5',
                      background: '#FEF2F2', color: '#DC2626', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>✕ Rejected</button>
                   {!isOffer ? (
                  <button onClick={() => onNextStage(app.id, app.current_stage)} style={{
                   padding: '6px 14px', borderRadius: 8, border: 'none',
                   background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                   color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                   }}>Next: {STAGES[stageIdx + 1]} →</button>
                   ) : (
                   <div style={{ display: 'flex', gap: 8 }}>
                   <input 
                      type="file" 
                      id={`upload-${app.id}`} 
                      style={{ display: 'none' }} 
                      onChange={(e) => onOfferUpload(app.id, e.target.files[0])}
                      />
                   <button onClick={() => document.getElementById(`upload-${app.id}`).click()} style={{
                   padding: '6px 14px', borderRadius: 8, border: 'none',
                   background: 'linear-gradient(135deg, #10B981, #059669)',
                   color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                   }}>📄 Upload Offer & Confirm</button>
                   </div>
                  )} 
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>
              {tab === 'Active' ? '🚀' : tab === 'Rejected' ? '😔' : '🏆'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
              No {tab.toLowerCase()} applications
            </div>
            <div style={{ fontSize: 13 }}>
              {tab === 'Active' ? 'Add a new application to start tracking' : `No applications marked as ${tab.toLowerCase()} yet`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ADMIN VIEW (By Student + By Company) ─────────────────────────────────────

function AdminView({ apps }) {
  const [groupBy, setGroupBy] = useState('student');
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('');

  const filtered = apps.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      a.student_name?.toLowerCase().includes(q) ||
      a.company_name?.toLowerCase().includes(q) ||
      a.job_role?.toLowerCase().includes(q);
    const matchStage = !filterStage || a.current_stage === filterStage;
    return matchSearch && matchStage;
  });

  // Group by student
  const byStudent = filtered.reduce((acc, a) => {
    const k = a.student_name || 'Unknown';
    if (!acc[k]) acc[k] = [];
    acc[k].push(a);
    return acc;
  }, {});

  // Group by company
  const byCompany = filtered.reduce((acc, a) => {
    const k = a.company_name || 'Unknown';
    if (!acc[k]) acc[k] = [];
    acc[k].push(a);
    return acc;
  }, {});

  const groups = groupBy === 'student' ? byStudent : byCompany;

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="🔍 Search student, company, role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, width: 260, background: '#fff' }}
        />
        <button 
          onClick={() => window.open(`http://localhost:5000/api/applications/export${filterStage ? '?stage='+filterStage : ''}`)}
          style={{
          padding: '10px 16px', background: '#059669', color: '#fff', 
          border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold'
        }}
        >
       📥 Download Stage Report (CSV)
       </button>
        <select value={filterStage} onChange={e => setFilterStage(e.target.value)}
          style={{ ...inputStyle, width: 150, background: '#fff' }}>
          <option value="">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Group toggle */}
        <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 8, padding: 3, marginLeft: 'auto' }}>
          {[['student', '👤 By Student'], ['company', '🏢 By Company']].map(([v, label]) => (
            <button key={v} onClick={() => setGroupBy(v)} style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 700,
              background: groupBy === v ? '#fff' : 'transparent',
              color: groupBy === v ? '#1E293B' : '#64748B',
              boxShadow: groupBy === v ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Stage quick-filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {STAGES.map(s => {
          const count = apps.filter(a => a.current_stage === s).length;
          const m = STAGE_META[s];
          const active = filterStage === s;
          return (
            <button key={s} onClick={() => setFilterStage(active ? '' : s)} style={{
              padding: '4px 12px', borderRadius: 20, border: `1.5px solid ${active ? m.border : '#E2E8F0'}`,
              background: active ? m.bg : '#F8FAFC', color: active ? m.text : '#64748B',
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
            }}>{m.icon} {s} ({count})</button>
          );
        })}
      </div>

      {/* Grouped sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Object.entries(groups).map(([groupName, groupApps]) => (
          <div key={groupName} style={{
            background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0',
            overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            {/* Group Header */}
            <div style={{
              background: '#F8FAFC', padding: '12px 18px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, #667EEA, #764BA2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 13, fontWeight: 800, flexShrink: 0,
              }}>{groupName[0]?.toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>{groupName}</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>{groupApps.length} application{groupApps.length !== 1 ? 's' : ''}</div>
              </div>
              {/* Mini stage summary */}
              <div style={{ display: 'flex', gap: 4, marginLeft: 'auto', flexWrap: 'wrap' }}>
                {STAGES.filter(s => groupApps.some(a => a.current_stage === s)).map(s => {
                  const cnt = groupApps.filter(a => a.current_stage === s).length;
                  const m = STAGE_META[s];
                  return (
                    <span key={s} style={{
                      padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                      background: m.bg, color: m.text, border: `1px solid ${m.border}`,
                    }}>{m.icon} {s}{cnt > 1 ? ` ×${cnt}` : ''}</span>
                  );
                })}
              </div>
            </div>

            {/* Application rows */}
            <div>
              {groupApps.map((app, i) => {
                const sm = STATUS_META[app.status] || STATUS_META['Active'];
                return (
                  <div key={app.id} style={{
                    display: 'flex', alignItems: 'center', padding: '14px 18px',
                    borderBottom: i < groupApps.length - 1 ? '1px solid #F1F5F9' : 'none',
                    gap: 14, flexWrap: 'wrap',
                  }}>
                    {/* Company / Student (opposite of group key) */}
                    <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1E293B' }}>
                        {groupBy === 'student' ? app.company_name : app.student_name}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>
                        {app.job_role}
                        {app.location && <span style={{ color: '#94A3B8' }}> · 📍 {app.location}</span>}
                      </div>
                    </div>

                    {/* Package */}
                    {app.package && (
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', flexShrink: 0 }}>
                        💰 {app.package}
                      </div>
                    )}

                    {/* Pipeline */}
                    <div style={{ flex: '2 1 300px' }}>
                      <StagePipeline current={app.current_stage} />
                    </div>

                    {/* Badges */}
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                      <StagePill stage={app.current_stage} />
                      <StatusPill status={app.status || 'Active'} />
                    </div>

                    {/* Date */}
                    <div style={{ fontSize: 11, color: '#CBD5E1', flexShrink: 0 }}>
                      {app.date_applied ? new Date(app.date_applied).toLocaleDateString('en-IN') : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {Object.keys(groups).length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>No applications found</div>
            <div style={{ fontSize: 13 }}>Try adjusting the search or filters</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

function ApplicationTracker({ role, user }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = role === 'admin'
        ? '/api/applications/all'
        : `/api/applications/student/${user?.id}`;
      const r = await api(endpoint);
      if (r.status === 'success') setApps(r.data);
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setLoading(false);
    }
  }, [role, user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const updateStage = async (appId, currentStage) => {
    const next = STAGES[STAGES.indexOf(currentStage) + 1];
    if (!next) return;
    await api(`/api/applications/${appId}/stage`, 'PATCH', { stage: next });
    loadData();
  };

  const updateStatus = async (appId, status) => {
    await api(`/api/applications/${appId}/stage`, 'PATCH', { status });
    loadData();
  };

  const handleOfferUpload = async (appId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Note: We use fetch here because it's easier for multipart/form-data
      const response = await fetch(`http://localhost:5000/api/applications/${appId}/upload-offer`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.status === 'success') {
        alert('🎉 Offer Letter Uploaded Successfully!');
        loadData(); 
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      alert('Cannot connect to server. Ensure Flask is running.');
    }
  };

  // Stats
  const total = apps.length;
  const active = apps.filter(a => (a.status || 'Active') === 'Active').length;
  const offers = apps.filter(a => a.current_stage === 'Offer').length;
  const selected = apps.filter(a => a.status === 'Selected').length;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#64748B', fontSize: 14 }}>
      ⏳ Loading applications...
    </div>
  );

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>
            {role === 'admin' ? '📋 Student Applications' : '🎯 My Applications'}
          </div>
          <div style={{ fontSize: 14, color: '#64748B', marginTop: 3 }}>
            {role === 'admin'
              ? `Tracking ${total} applications across all students`
              : 'Track your placement journey stage by stage'}
          </div>
        </div>
        {role === 'student' && (
          <button onClick={() => setShowForm(true)} style={{
            padding: '10px 22px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
            color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
          }}>+ New Application</button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: total, color: '#3B82F6', bg: '#EFF6FF' },
          { label: 'Active', value: active, color: '#8B5CF6', bg: '#F5F3FF' },
          { label: 'Offers', value: offers, color: '#059669', bg: '#ECFDF5' },
          { label: 'Selected', value: selected, color: '#D97706', bg: '#FFFBEB' },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: 12, padding: '14px 22px', flex: '1 1 100px',
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main content */}
      {role === 'admin'
        ? <AdminView apps={apps} />
       : <StudentView 
          apps={apps} 
          onNextStage={updateStage} 
          onUpdateStatus={updateStatus} 
         onOfferUpload={handleOfferUpload} 
         />
      }

      {/* Add Application Modal */}
      <Modal show={showForm} title="Track New Application" onClose={() => setShowForm(false)}>
        <AddApplicationForm
          user={user}
          onSuccess={() => { setShowForm(false); loadData(); }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}

export default ApplicationTracker;
