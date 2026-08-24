import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "", jobTitle: "", company: "" });
  const [recruiter, setRecruiter] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedPortal, setCopiedPortal] = useState(false);
  const [activeTab, setActiveTab] = useState("candidates");
  const [refreshing, setRefreshing] = useState(false);

  const fetchCandidates = useCallback(async (portalId, silent = false) => {
    if (!portalId) return;
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(`http://localhost:5000/recruiter/candidates/${portalId}`);
      const data = await res.json();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("recruiter");
    if (saved) {
      const parsed = JSON.parse(saved);
      setRecruiter(parsed);
      setView("dashboard");
      fetchCandidates(parsed.portalId);
    }
  }, [fetchCandidates]);

  // Auto-refresh every 15s when on dashboard
  useEffect(() => {
    if (view !== "dashboard" || !recruiter?.portalId) return;
    const interval = setInterval(() => fetchCandidates(recruiter.portalId, true), 15000);
    return () => clearInterval(interval);
  }, [view, recruiter, fetchCandidates]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) return setError("Fill all fields");
    setLoading(true); setError("");
    try {
      const res = await fetch("http://localhost:5000/recruiter/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Login failed");
      localStorage.setItem("recruiter", JSON.stringify(data));
      setRecruiter(data);
      setView("dashboard");
      fetchCandidates(data.portalId);
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password, jobTitle, company } = registerData;
    if (!name || !email || !password || !jobTitle || !company) return setError("Fill all fields");
    setLoading(true); setError("");
    try {
      const res = await fetch("http://localhost:5000/recruiter/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData)
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Registration failed");
      setError("");
      alert(`✅ Account created!\n\nYour Portal ID: ${data.portalId}\n\nShare this with candidates so they can apply.`);
      setView("login");
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:5000/recruiter/candidate/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      // Optimistic update
      setCandidates(prev => prev.map(c => c._id === id ? { ...c, status } : c));
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("recruiter");
    setRecruiter(null);
    setView("login");
    setCandidates([]);
  };

  const copyPortalId = () => {
    navigator.clipboard.writeText(recruiter?.portalId || "");
    setCopiedPortal(true);
    setTimeout(() => setCopiedPortal(false), 2000);
  };

  const filtered = [...candidates]
    .filter(c => filterStatus === "All" || c.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === "ats") return b.atsScore - a.atsScore;
      if (sortBy === "bias") return b.biasFreeScore - a.biasFreeScore;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const avgAts = candidates.length
    ? Math.round(candidates.reduce((s, c) => s + c.atsScore, 0) / candidates.length) : 0;
  const shortlisted = candidates.filter(c => c.status === "Shortlisted").length;
  const rejected = candidates.filter(c => c.status === "Rejected").length;
  const pending = candidates.filter(c => c.status === "Applied" || c.status === "Pending").length;

  // ===== AUTH SCREEN =====
  if (view === "login" || view === "register") {
    return (
      <div style={s.root}>
        <div style={{ ...s.orb, ...s.orb1 }} />
        <div style={{ ...s.orb, ...s.orb2 }} />
        <div style={s.grid} />
        <button style={s.back} onClick={() => navigate("/role")}>← Back</button>

        <div style={s.authCard}>
          <div style={s.iconWrap}>⚖️</div>
          <h2 style={s.authTitle}>{view === "login" ? "Recruiter Login" : "Create Account"}</h2>
          <p style={s.authSub}>{view === "login" ? "Access your hiring portal" : "Set up your FairHire recruiter account"}</p>

          <div style={s.tabs}>
            <button style={view === "login" ? { ...s.tab, ...s.tabActive } : s.tab}
              onClick={() => { setView("login"); setError(""); }}>Login</button>
            <button style={view === "register" ? { ...s.tab, ...s.tabActive } : s.tab}
              onClick={() => { setView("register"); setError(""); }}>Register</button>
          </div>

          {error && <div style={s.errorBox}>{error}</div>}

          {view === "login" ? (
            <form onSubmit={handleLogin} style={s.form}>
              <RField label="Email" type="email" placeholder="recruiter@company.com"
                value={loginData.email} onChange={v => setLoginData({ ...loginData, email: v })} />
              <RField label="Password" type="password" placeholder="••••••••"
                value={loginData.password} onChange={v => setLoginData({ ...loginData, password: v })} />
              <RBtn loading={loading}>Login →</RBtn>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={s.form}>
              <div style={s.row}>
                <RField label="Full Name" placeholder="Jane Smith"
                  value={registerData.name} onChange={v => setRegisterData({ ...registerData, name: v })} />
                <RField label="Email" type="email" placeholder="jane@company.com"
                  value={registerData.email} onChange={v => setRegisterData({ ...registerData, email: v })} />
              </div>
              <div style={s.row}>
                <RField label="Password" type="password" placeholder="••••••••"
                  value={registerData.password} onChange={v => setRegisterData({ ...registerData, password: v })} />
                <RField label="Company" placeholder="Acme Corp"
                  value={registerData.company} onChange={v => setRegisterData({ ...registerData, company: v })} />
              </div>
              <RField label="Job Title" placeholder="e.g. Senior Frontend Developer"
                value={registerData.jobTitle} onChange={v => setRegisterData({ ...registerData, jobTitle: v })} />
              <RBtn loading={loading}>Create Account →</RBtn>
            </form>
          )}

          <p style={s.footNote}>
            {view === "login" ? "No account? " : "Have account? "}
            <span style={s.link} onClick={() => { setView(view === "login" ? "register" : "login"); setError(""); }}>
              {view === "login" ? "Register here" : "Login here"}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // ===== MAIN DASHBOARD =====
  return (
    <div style={s.dashRoot}>
      <div style={{ ...s.orb, ...s.orb1Dash }} />
      <div style={{ ...s.orb, ...s.orb2Dash }} />
      <div style={s.grid} />

      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.sideLogoTxt}>⚖️ FairHire</div>
          <div style={{ ...s.avatar, background: "linear-gradient(135deg,#b8863a,#e8c073)" }}>
            {recruiter?.name?.[0]?.toUpperCase() || "R"}
          </div>
          <h3 style={s.sidebarName}>{recruiter?.name}</h3>
          <p style={s.sidebarEmail}>{recruiter?.email || ""}</p>
        </div>

        {/* Portal ID badge — clickable to copy */}
        <div style={s.portalBadge} onClick={copyPortalId} title="Click to copy">
          <p style={s.badgeLabel}>Your Portal ID</p>
          <p style={s.badgeId}>{recruiter?.portalId}</p>
          <p style={s.badgeCopy}>{copiedPortal ? "✅ Copied!" : "📋 Click to copy"}</p>
        </div>

        <div style={s.sideNav}>
          <button style={activeTab === "candidates" ? { ...s.sideBtn, ...s.sideBtnActive } : s.sideBtn}
            onClick={() => setActiveTab("candidates")}>👥 Candidates</button>
          <button style={activeTab === "stats" ? { ...s.sideBtn, ...s.sideBtnActive } : s.sideBtn}
            onClick={() => setActiveTab("stats")}>📊 Analytics</button>
        </div>

        <button style={s.logoutBtn} onClick={handleLogout}>Sign Out</button>
      </div>

      {/* Main Panel */}
      <div style={s.mainPanel}>
        {/* Header */}
        <div style={s.dashHeader}>
          <div>
            <h1 style={s.dashTitle}>Hey, {recruiter?.name?.split(" ")[0]} 👋</h1>
            <p style={s.dashSub}>Manage and shortlist candidates from your portal</p>
          </div>
          <button style={{ ...s.refreshBtn, opacity: refreshing ? 0.6 : 1 }}
            onClick={() => fetchCandidates(recruiter.portalId)} disabled={refreshing}>
            {refreshing ? "⏳" : "🔄"} Refresh
          </button>
        </div>

        {/* KPI Row */}
        <div style={s.kpiRow}>
          <KpiCard value={candidates.length} label="Total Applicants" color="#e8c073" icon="👥" />
          <KpiCard value={shortlisted} label="Shortlisted" color="#4fceae" icon="✅" />
          <KpiCard value={rejected} label="Rejected" color="#e0685f" icon="❌" />
          <KpiCard value={pending} label="Pending Review" color="#6fa8dc" icon="⏳" />
          <KpiCard value={`${avgAts}%`} label="Avg ATS Score" color="#d1934f" icon="📈" />
        </div>

        {activeTab === "candidates" && (
          <>
            {/* Controls */}
            <div style={s.controlsBar}>
              <select style={s.ctrlSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="date">Sort: Latest First</option>
                <option value="ats">Sort: ATS Score ↓</option>
                <option value="bias">Sort: Bias-Free Score ↓</option>
              </select>
              <select style={s.ctrlSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="All">All Candidates</option>
                <option value="Applied">Applied</option>
                <option value="Pending">Pending</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Rejected">Rejected</option>
              </select>
              <span style={s.countBadge}>{filtered.length} shown</span>
            </div>

            {/* Candidate Cards */}
            {filtered.length === 0 ? (
              <div style={s.emptyState}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "1rem" }}>
                  No candidates yet. Share your Portal ID:
                </p>
                <div style={s.emptyPortal} onClick={copyPortalId}>
                  {recruiter?.portalId} {copiedPortal ? "✅" : "📋"}
                </div>
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                  Auto-refreshes every 15 seconds
                </p>
              </div>
            ) : (
              <div style={s.candidatesGrid}>
                {filtered.map(c => (
                  <CandidateCard key={c._id} c={c} onStatus={updateStatus} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "stats" && (
          <div style={s.statsSection}>
            <div style={s.statsGrid}>
              <div style={s.statCard}>
                <h3 style={s.statTitle}>Score Distribution</h3>
                {candidates.length === 0
                  ? <p style={s.noData}>No data yet</p>
                  : candidates.map(c => (
                    <div key={c._id} style={{ marginBottom: "0.75rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>{c.name}</span>
                        <span style={{ fontSize: "0.8rem", color: "#e8c073" }}>{c.atsScore}%</span>
                      </div>
                      <div style={s.barBg}>
                        <div style={{ ...s.barFill, width: `${c.atsScore}%`, background: "linear-gradient(90deg,#b8863a,#e8c073)" }} />
                      </div>
                    </div>
                  ))
                }
              </div>
              <div style={s.statCard}>
                <h3 style={s.statTitle}>Bias-Free Scores</h3>
                {candidates.length === 0
                  ? <p style={s.noData}>No data yet</p>
                  : candidates.map(c => (
                    <div key={c._id} style={{ marginBottom: "0.75rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>{c.name}</span>
                        <span style={{ fontSize: "0.8rem", color: "#4fceae" }}>{c.biasFreeScore}%</span>
                      </div>
                      <div style={s.barBg}>
                        <div style={{ ...s.barFill, width: `${c.biasFreeScore}%`, background: "linear-gradient(90deg,#2f8f6f,#4fceae)" }} />
                      </div>
                    </div>
                  ))
                }
              </div>
              <div style={s.statCard}>
                <h3 style={s.statTitle}>Status Breakdown</h3>
                <StatusPie shortlisted={shortlisted} rejected={rejected} pending={pending} total={candidates.length} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Candidate Card ──
const CandidateCard = ({ c, onStatus }) => {
  const statusColor = {
    Shortlisted: { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.25)", text: "#4fceae" },
    Rejected:    { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.25)", text: "#e0685f" },
    Applied:     { bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.25)", text: "#6fa8dc" },
    Pending:     { bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.25)", text: "#6fa8dc" },
  }[c.status] || { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)", text: "#fff" };

  return (
    <div style={s.candidateCard}>
      <div style={s.cardTop}>
        <div style={s.cardAvatar}>{c.name?.[0]?.toUpperCase() || "?"}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={s.cardName}>{c.name}</h3>
          <p style={s.cardEmail}>📧 {c.email}</p>
          <p style={s.cardDate}>📅 {new Date(c.createdAt).toLocaleDateString()}</p>
        </div>
        <span style={{ ...s.statusBadge, background: statusColor.bg, border: `1px solid ${statusColor.border}`, color: statusColor.text }}>
          {c.status}
        </span>
      </div>

      <div style={s.scoreRow}>
        <span style={s.scoreLabel}>ATS</span>
        <div style={s.barBg}>
          <div style={{ ...s.barFill, width: `${c.atsScore}%`, background: "linear-gradient(90deg,#b8863a,#e8c073)" }} />
        </div>
        <span style={{ ...s.scoreNum, color: "#e8c073" }}>{c.atsScore}%</span>
      </div>

      <div style={s.scoreRow}>
        <span style={s.scoreLabel}>Bias-Free</span>
        <div style={s.barBg}>
          <div style={{ ...s.barFill, width: `${c.biasFreeScore}%`, background: "linear-gradient(90deg,#2f8f6f,#4fceae)" }} />
        </div>
        <span style={{ ...s.scoreNum, color: "#4fceae" }}>{c.biasFreeScore}%</span>
      </div>

      <div style={s.cardActions}>
        <button style={s.btnShortlist} onClick={() => onStatus(c._id, "Shortlisted")}>✅ Shortlist</button>
        <button style={s.btnReject} onClick={() => onStatus(c._id, "Rejected")}>❌ Reject</button>
        <button style={s.btnReset} onClick={() => onStatus(c._id, "Applied")}>🔄</button>
      </div>
    </div>
  );
};

const KpiCard = ({ value, label, color, icon }) => (
  <div style={{ ...s.kpiCard, borderColor: color + "30" }}>
    <div style={{ fontSize: "1.4rem", marginBottom: "0.4rem" }}>{icon}</div>
    <div style={{ ...s.kpiVal, color }}>{value}</div>
    <div style={s.kpiLabel}>{label}</div>
  </div>
);

const StatusPie = ({ shortlisted, rejected, pending, total }) => {
  if (total === 0) return <p style={{ color: "rgba(255,255,255,0.3)" }}>No data yet</p>;
  const items = [
    { label: "Shortlisted", val: shortlisted, color: "#4fceae" },
    { label: "Rejected", val: rejected, color: "#e0685f" },
    { label: "Pending", val: pending, color: "#6fa8dc" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
      {items.map(i => (
        <div key={i.label}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)" }}>{i.label}</span>
            <span style={{ fontSize: "0.82rem", color: i.color }}>{i.val} / {total}</span>
          </div>
          <div style={s.barBg}>
            <div style={{ ...s.barFill, width: `${total ? (i.val / total) * 100 : 0}%`, background: i.color }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const RField = ({ label, type = "text", placeholder, value, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 0 }}>
      <label style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ padding: "0.7rem 0.9rem", background: focused ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)", border: `1px solid ${focused ? "#e8c073" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, color: "#fff", fontSize: "0.88rem", fontFamily: "'Inter',sans-serif", outline: "none", width: "100%", boxSizing: "border-box", transition: "all 0.2s" }} />
    </div>
  );
};

const RBtn = ({ children, loading }) => (
  <button type="submit" disabled={loading}
    style={{ padding: "0.85rem", background: "linear-gradient(135deg,#b8863a,#e8c073)", border: "none", borderRadius: 50, color: "#fff", fontSize: "1rem", fontFamily: "'Fraunces',sans-serif", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: "0.5rem", opacity: loading ? 0.7 : 1, transition: "all 0.2s", width: "100%" }}>
    {loading ? "Please wait..." : children}
  </button>
);

// ─── Styles ───
const s = {
  // Shared
  root: { minHeight: "100vh", background: "#0a0e1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif", position: "relative", overflow: "hidden", padding: "2rem" },
  orb: { position: "absolute", borderRadius: "50%", filter: "blur(90px)", opacity: 0.25, pointerEvents: "none" },
  orb1: { width: 500, height: 500, background: "radial-gradient(circle,#b8863a,transparent)", bottom: -150, right: -150 },
  orb2: { width: 400, height: 400, background: "radial-gradient(circle,#2f8f6f,transparent)", top: -100, left: -100 },
  orb1Dash: { width: 500, height: 500, background: "radial-gradient(circle,#b8863a,transparent)", bottom: -150, right: -150 },
  orb2Dash: { width: 400, height: 400, background: "radial-gradient(circle,#2f8f6f,transparent)", top: -100, left: -100 },
  grid: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" },
  back: { position: "fixed", top: "1.5rem", left: "2rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", padding: "0.45rem 1.1rem", borderRadius: 50, fontSize: "0.85rem", cursor: "pointer", zIndex: 10, fontFamily: "'Inter',sans-serif" },
  // Auth
  authCard: { position: "relative", zIndex: 2, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 28, padding: "2.2rem", width: "100%", maxWidth: 560, color: "#fff" },
  iconWrap: { width: 56, height: 56, background: "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(124,58,237,0.1))", border: "1px solid rgba(167,139,250,0.25)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", marginBottom: "1rem" },
  authTitle: { fontFamily: "'Fraunces',sans-serif", fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.3rem" },
  authSub: { fontSize: "0.88rem", color: "rgba(255,255,255,0.4)", marginBottom: "1.2rem" },
  tabs: { display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 4, marginBottom: "1.2rem", gap: 4 },
  tab: { flex: 1, padding: "0.5rem", background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", borderRadius: 10, cursor: "pointer", fontSize: "0.9rem", fontFamily: "'Inter',sans-serif", transition: "all 0.2s" },
  tabActive: { background: "rgba(167,139,250,0.15)", color: "#e8c073", border: "1px solid rgba(167,139,250,0.2)" },
  errorBox: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#eeb0aa", padding: "0.6rem 1rem", borderRadius: 10, fontSize: "0.82rem", marginBottom: "1rem" },
  form: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  row: { display: "flex", gap: "0.75rem" },
  footNote: { fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: "1rem" },
  link: { color: "#e8c073", cursor: "pointer", textDecoration: "underline" },
  // Dashboard layout
  dashRoot: { minHeight: "100vh", background: "#0a0e1a", display: "flex", fontFamily: "'Inter',sans-serif", color: "#fff", position: "relative", overflow: "hidden" },
  sidebar: { width: 260, flexShrink: 0, background: "rgba(255,255,255,0.03)", borderRight: "1px solid rgba(255,255,255,0.07)", padding: "1.5rem 1.2rem", display: "flex", flexDirection: "column", position: "relative", zIndex: 2, minHeight: "100vh" },
  sideTop: { textAlign: "center", paddingBottom: "1.2rem", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: "1.2rem" },
  sideLogoTxt: { fontFamily: "'Fraunces',sans-serif", fontWeight: 800, fontSize: "1.1rem", background: "linear-gradient(135deg,#e8c073,#4fceae)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "1rem" },
  avatar: { width: 60, height: 60, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces',sans-serif", fontWeight: 800, fontSize: "1.5rem", margin: "0 auto 0.75rem", color: "#fff" },
  sidebarName: { fontFamily: "'Fraunces',sans-serif", fontSize: "1rem", fontWeight: 700, marginBottom: "0.2rem" },
  sidebarEmail: { fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" },
  portalBadge: { background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 12, padding: "0.8rem", marginBottom: "1rem", cursor: "pointer", transition: "all 0.2s" },
  badgeLabel: { fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.2rem" },
  badgeId: { fontSize: "0.82rem", color: "#e8c073", fontFamily: "monospace", fontWeight: 600 },
  badgeCopy: { fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginTop: "0.3rem" },
  sideNav: { display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "auto" },
  sideBtn: { padding: "0.6rem 1rem", background: "transparent", border: "1px solid transparent", borderRadius: 10, color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", cursor: "pointer", textAlign: "left", fontFamily: "'Inter',sans-serif", transition: "all 0.2s" },
  sideBtnActive: { background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", color: "#e8c073" },
  logoutBtn: { marginTop: "1.5rem", padding: "0.6rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10, color: "#eeb0aa", fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Inter',sans-serif" },
  // Main panel
  mainPanel: { flex: 1, padding: "2rem", overflowY: "auto", position: "relative", zIndex: 2 },
  dashHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" },
  dashTitle: { fontFamily: "'Fraunces',sans-serif", fontSize: "1.8rem", fontWeight: 800 },
  dashSub: { color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", marginTop: "0.3rem" },
  refreshBtn: { padding: "0.5rem 1.2rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 50, color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Inter',sans-serif" },
  // KPI
  kpiRow: { display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" },
  kpiCard: { flex: "1 1 120px", background: "rgba(255,255,255,0.03)", border: "1px solid", borderRadius: 16, padding: "1rem", textAlign: "center" },
  kpiVal: { fontFamily: "'Fraunces',sans-serif", fontSize: "1.6rem", fontWeight: 800 },
  kpiLabel: { fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: "0.2rem" },
  // Controls
  controlsBar: { display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1.2rem", flexWrap: "wrap" },
  ctrlSelect: { padding: "0.5rem 0.9rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: "0.85rem", fontFamily: "'Inter',sans-serif", outline: "none", cursor: "pointer" },
  countBadge: { marginLeft: "auto", fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", padding: "0.3rem 0.8rem", borderRadius: 20 },
  emptyState: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "4rem", textAlign: "center" },
  emptyPortal: { display: "inline-block", marginTop: "0.75rem", padding: "0.5rem 1.2rem", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 20, color: "#e8c073", fontFamily: "monospace", fontSize: "0.9rem", cursor: "pointer" },
  candidatesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "1rem" },
  candidateCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.2rem", display: "flex", flexDirection: "column", gap: "0.75rem" },
  cardTop: { display: "flex", gap: "0.75rem", alignItems: "flex-start" },
  cardAvatar: { width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#b8863a,#e8c073)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces',sans-serif", fontWeight: 800, fontSize: "1.1rem", flexShrink: 0, color: "#fff" },
  cardName: { fontFamily: "'Fraunces',sans-serif", fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.15rem" },
  cardEmail: { fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" },
  cardDate: { fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginTop: "0.1rem" },
  statusBadge: { padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, flexShrink: 0 },
  scoreRow: { display: "flex", alignItems: "center", gap: "0.6rem" },
  scoreLabel: { fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", width: 55, flexShrink: 0 },
  barBg: { flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 10, transition: "width 0.5s ease" },
  scoreNum: { fontSize: "0.78rem", fontWeight: 700, width: 36, textAlign: "right", flexShrink: 0 },
  cardActions: { display: "flex", gap: "0.5rem", marginTop: "0.25rem" },
  btnShortlist: { flex: 1, padding: "0.45rem 0", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, color: "#4fceae", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Inter',sans-serif" },
  btnReject: { flex: 1, padding: "0.45rem 0", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, color: "#e0685f", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Inter',sans-serif" },
  btnReset: { padding: "0.45rem 0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Inter',sans-serif" },
  statsSection: { marginTop: "0.5rem" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1rem" },
  statCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.2rem" },
  statTitle: { fontFamily: "'Fraunces',sans-serif", fontSize: "0.9rem", fontWeight: 700, marginBottom: "1rem", color: "rgba(255,255,255,0.8)" },
  noData: { color: "rgba(255,255,255,0.25)", fontSize: "0.85rem" },
};

export default RecruiterDashboard;