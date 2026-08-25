import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

// Inject keyframe animations once
const ANIM_STYLE = `
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes barGrow {
  from { width: 0%; }
}
@keyframes circleReveal {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}
`;
if (typeof document !== "undefined" && !document.getElementById("fairhire-anim")) {
  const tag = document.createElement("style");
  tag.id = "fairhire-anim";
  tag.textContent = ANIM_STYLE;
  document.head.appendChild(tag);
}

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem("candidateUser") || "null"));

  const [jd, setJd] = useState("");
  const [resume, setResume] = useState(null);
  const [result, setResult] = useState(null); // full API result
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [portalId, setPortalId] = useState("");
  const [portalValid, setPortalValid] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("analyze");

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/candidate/history/${user.email}`);
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  }, [user]);

  useEffect(() => {
    if (!user) { navigate("/candidate-login"); return; }
    fetchHistory();
  }, [user, navigate, fetchHistory]);

  const validatePortal = async () => {
    if (!portalId.trim()) return alert("Enter a Portal ID");
    setPortalLoading(true);
    try {
      const res = await fetch(`${API_URL}/portal/${portalId}`);
      const data = await res.json();
      if (data.valid) { setPortalValid(true); setJobTitle(data.jobTitle); }
      else alert("❌ Invalid Portal ID");
    } catch { alert("Cannot connect to server"); }
    finally { setPortalLoading(false); }
  };

  const calculateATS = async () => {
    if (!jd || !resume) return alert("Please enter JD and upload resume");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("jd", jd);
      formData.append("candidateName", user.name);
      formData.append("candidateEmail", user.email);
      formData.append("portalId", portalId);
      formData.append("resume", resume);
      const res = await fetch(`${API_URL}/analyze-v2`, { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      setResult(data);
      fetchHistory();
    } catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("candidateUser");
    navigate("/candidate-login");
  };

  // ── Portal Entry Screen ──
  if (!portalValid) {
    return (
      <div style={s.root}>
        <div style={{ ...s.orb, ...s.orb1 }} /><div style={{ ...s.orb, ...s.orb2 }} /><div style={s.grid} />
        <div style={s.portalCard}>
          <div style={s.portalIcon}>🔗</div>
          <h2 style={s.portalTitle}>Enter Portal ID</h2>
          <p style={s.portalSub}>Ask your recruiter for the Portal ID to proceed</p>
          {user && <p style={s.portalUser}>Logged in as <b style={{ color: "#4fceae" }}>{user.name}</b></p>}
          <input style={s.portalInput} placeholder="e.g. PORTAL_AB12CD34"
            value={portalId} onChange={e => setPortalId(e.target.value.toUpperCase())} />
          <button style={s.portalBtn} onClick={validatePortal} disabled={portalLoading}>
            {portalLoading ? "Validating..." : "Enter Portal →"}
          </button>
          <button style={s.logoutSmall} onClick={handleLogout}>Sign Out</button>
        </div>
      </div>
    );
  }

  // ── Main Dashboard ──
  return (
    <div style={s.dashRoot}>
      <div style={{ ...s.orb, ...s.orb1Dash }} /><div style={{ ...s.orb, ...s.orb2Dash }} /><div style={s.grid} />

      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.sideLogoTxt}>⚖️ FairHire</div>
          <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || "?"}</div>
          <h3 style={s.sidebarName}>{user?.name}</h3>
          <p style={s.sidebarEmail}>{user?.email}</p>
        </div>

        <div style={s.sideInfo}>
          {user?.phone   && <SideRow icon="📞" val={user.phone} />}
          {user?.college && <SideRow icon="🏛️" val={user.college} />}
          {user?.degree  && <SideRow icon="🎓" val={user.degree} />}
          {user?.skills  && <SideRow icon="⚡" val={user.skills} />}
        </div>

        <div style={s.portalBadge}>
          <p style={s.badgeLabel}>Active Portal</p>
          <p style={s.badgeId}>{portalId}</p>
          <p style={s.badgeJob}>{jobTitle}</p>
        </div>

        <div style={s.sideNav}>
          <button style={activeTab === "analyze" ? { ...s.sideBtn, ...s.sideBtnActive } : s.sideBtn} onClick={() => setActiveTab("analyze")}>📊 Analyze Resume</button>
          <button style={activeTab === "history" ? { ...s.sideBtn, ...s.sideBtnActive } : s.sideBtn} onClick={() => setActiveTab("history")}>🕒 History</button>
        </div>

        <button style={s.logoutBtn} onClick={handleLogout}>Sign Out</button>
      </div>

      {/* Main Panel */}
      <div style={s.mainPanel}>

        {/* Header */}
        <div style={s.dashHeader}>
          <div>
            <h1 style={s.dashTitle}>Hey, {user?.name?.split(" ")[0]} 👋</h1>
            <p style={s.dashSub}>Check how your resume matches the job description</p>
          </div>
          {result && (
            <div style={s.scoreChip}>
              <span style={s.scoreChipNum}>{result.biasFreeScore}%</span>
              <span style={s.scoreChipLabel}>Bias-Free Score</span>
            </div>
          )}
        </div>

        {activeTab === "analyze" && (
          <div style={s.analyzeGrid}>
            {/* JD Card */}
            <div style={s.glassCard}>
              <h3 style={s.cardTitle}>📋 Job Description</h3>
              <textarea style={s.textarea} placeholder="Paste the job description here..."
                value={jd} onChange={e => setJd(e.target.value)} rows={8} />
            </div>

            {/* Resume Card */}
            <div style={s.glassCard}>
              <h3 style={s.cardTitle}>📄 Upload Resume</h3>
              <label style={s.uploadLabel}>
                <div style={s.uploadBox}>
                  <span style={{ fontSize: "2rem" }}>📁</span>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                    {resume ? resume.name : "Click to upload PDF"}
                  </span>
                </div>
                <input type="file" accept=".pdf" style={{ display: "none" }} onChange={e => setResume(e.target.files[0])} />
              </label>
              <button style={{ ...s.calcBtn, opacity: loading ? 0.6 : 1 }} onClick={calculateATS} disabled={loading}>
                {loading ? "⏳ Analyzing..." : "⚡ Calculate ATS Score"}
              </button>
            </div>

            {/* Results */}
            {result && (
              <div style={{ ...s.glassCard, gridColumn: "1/-1", animation: "fadeSlideUp 0.5s ease both" }}>
                <h3 style={s.cardTitle}>📊 Your Results</h3>

                {/* Score Circles Row — 4 metrics */}
                <div style={s.resultsGrid}>
                  <ScoreCircle score={result.originalScore         ?? 0} label="Original ATS Score"  color="#e8c073" delay="0ms"   />
                  <ScoreCircle score={result.biasFreeScore         ?? 0} label="Bias-Free Score"      color="#4fceae" delay="80ms"  />
                  <ScoreCircle score={result.cosineSimilarityScore ?? 0} label="Semantic Match"       color="#6fa8dc" delay="160ms" />
                  <ScoreCircle score={result.keywordOverlapScore   ?? 0} label="Skill Keyword Match"  color="#c2703c" delay="240ms" />

                  {/* Bias Tags */}
                  <div style={s.biasBox}>
                    <h4 style={{ color: "#fff", marginBottom: "0.75rem", fontFamily: "'Fraunces',sans-serif", fontSize: "0.9rem" }}>✅ Bias Removed</h4>
                    {result.biasRemoved?.name     && <BiasTag>Name</BiasTag>}
                    {result.biasRemoved?.gender   && <BiasTag>Gender</BiasTag>}
                    {result.biasRemoved?.age      && <BiasTag>Age</BiasTag>}
                    {result.biasRemoved?.location && <BiasTag>Location</BiasTag>}
                    {result.biasRemoved?.college  && <BiasTag>College</BiasTag>}
                    <p style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.3)", marginTop: "0.75rem", lineHeight: 1.5 }}>
                      ✨ Evaluated purely on skill relevance
                    </p>
                  </div>
                </div>

                {/* NLP Analysis Card */}
                <div style={s.nlpSection}>
                  <div style={s.nlpHeaderRow}>
                    <span style={s.nlpTitleBadge}>🧠 AI</span>
                    <h4 style={s.nlpTitle}>NLP Analysis</h4>
                  </div>

                  <div style={s.nlpMetricRow}>
                    <div style={s.nlpMetricItem}>
                      <div style={s.nlpMetricTop}>
                        <span style={s.nlpMetricLabel}>Semantic Match</span>
                        <span style={{ ...s.nlpMetricVal, color: "#6fa8dc" }}>{result.cosineSimilarityScore ?? 0}%</span>
                      </div>
                      <div style={s.barTrack}>
                        <div style={{ ...s.barFill, width: `${result.cosineSimilarityScore ?? 0}%`, background: "linear-gradient(90deg,#4a7fc4,#6fa8dc)" }} />
                      </div>
                    </div>

                    <div style={s.nlpMetricItem}>
                      <div style={s.nlpMetricTop}>
                        <span style={s.nlpMetricLabel}>Skill Keyword Match</span>
                        <span style={{ ...s.nlpMetricVal, color: "#c2703c" }}>{result.keywordOverlapScore ?? 0}%</span>
                      </div>
                      <div style={s.barTrack}>
                        <div style={{ ...s.barFill, width: `${result.keywordOverlapScore ?? 0}%`, background: "linear-gradient(90deg,#9c5726,#c2703c)" }} />
                      </div>
                    </div>
                  </div>

                  {/* Top Matched Skills */}
                  {(result.topMatchedTerms?.length > 0) && (
                    <div style={s.topSkillsBlock}>
                      <p style={s.topSkillsLabel}>Top Matched Skills</p>
                      <div style={s.termsWrap}>
                        {result.topMatchedTerms.map((term, i) => (
                          <TermChip key={i} rank={i + 1} delay={`${i * 40}ms`}>{term}</TermChip>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div style={s.historySection}>
            <h3 style={s.cardTitle}>🕒 Submission History</h3>
            {history.length === 0
              ? <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "3rem" }}>No submissions yet</p>
              : history.map((item, i) => (
                <div key={i} style={s.histRow}>
                  <div>
                    <p style={s.histDate}>{new Date(item.createdAt).toLocaleString()}</p>
                    <p style={s.histPortal}>Portal: {item.portalId}</p>
                  </div>
                  <div style={s.histScores}>
                    <span style={{ ...s.histBadge, background: "rgba(167,139,250,0.15)", color: "#f0d9a8" }}>ATS: {item.atsScore}%</span>
                    <span style={{ ...s.histBadge, background: "rgba(52,211,153,0.15)",  color: "#8fe0c4" }}>Bias-Free: {item.biasFreeScore}%</span>
                    {item.cosineSimilarityScore != null && (
                      <span style={{ ...s.histBadge, background: "rgba(96,165,250,0.15)", color: "#a9c9e8" }}>Cosine: {item.cosineSimilarityScore}%</span>
                    )}
                    {item.keywordOverlapScore != null && (
                      <span style={{ ...s.histBadge, background: "rgba(245,158,11,0.15)", color: "#dba36a" }}>Keywords: {item.keywordOverlapScore}%</span>
                    )}
                    <span style={{
                      ...s.histBadge,
                      background: item.status === "Shortlisted" ? "rgba(52,211,153,0.15)" : item.status === "Rejected" ? "rgba(239,68,68,0.15)" : "rgba(96,165,250,0.15)",
                      color:      item.status === "Shortlisted" ? "#4fceae"               : item.status === "Rejected" ? "#e0685f"               : "#6fa8dc"
                    }}>{item.status}</span>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
};

// ── Sub-components ──

const SideRow = ({ icon, val }) => (
  <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", marginBottom: "0.5rem" }}>
    <span style={{ fontSize: "0.85rem" }}>{icon}</span>
    <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>{val}</span>
  </div>
);

const ScoreCircle = ({ score, label, color, delay = "0ms" }) => (
  <div style={{ textAlign: "center", animation: `circleReveal 0.5s ease both`, animationDelay: delay }}>
    <div style={{ width: 100, height: 100, borderRadius: "50%", background: `conic-gradient(${color} ${(score ?? 0) * 3.6}deg, rgba(255,255,255,0.06) 0deg)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem", boxShadow: `0 0 28px ${color}33`, transition: "background 0.8s ease" }}>
      <div style={{ width: 78, height: 78, borderRadius: "50%", background: "#0d1326", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces',sans-serif", fontWeight: 800, fontSize: "1.25rem", color }}>
        {score ?? 0}%
      </div>
    </div>
    <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", maxWidth: 90, margin: "0 auto", lineHeight: 1.4 }}>{label}</p>
  </div>
);

const BiasTag = ({ children }) => (
  <span style={{ display: "inline-block", padding: "3px 10px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 20, fontSize: "0.75rem", color: "#4fceae", marginRight: "0.4rem", marginBottom: "0.4rem" }}>
    ✓ {children}
  </span>
);

const TermChip = ({ children, rank, delay = "0ms" }) => {
  const opacity = Math.max(0.55, 1 - rank * 0.07);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "5px 13px", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 20, fontSize: "0.8rem", color: "#a9c9e8", marginRight: "0.4rem", marginBottom: "0.4rem", opacity, animation: `fadeSlideUp 0.4s ease both`, animationDelay: delay }}>
      {children}
    </span>
  );
};

// ── Styles ──
const s = {
  root: { minHeight: "100vh", background: "#0a0e1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif", position: "relative", overflow: "hidden", padding: "2rem" },
  orb: { position: "absolute", borderRadius: "50%", filter: "blur(90px)", opacity: 0.25, pointerEvents: "none" },
  orb1: { width: 500, height: 500, background: "radial-gradient(circle,#2f8f6f,transparent)", bottom: -150, right: -150 },
  orb2: { width: 400, height: 400, background: "radial-gradient(circle,#b8863a,transparent)", top: -100, left: -100 },
  grid: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" },
  portalCard: { position: "relative", zIndex: 2, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 28, padding: "2.5rem 2.2rem", width: "100%", maxWidth: 440, textAlign: "center", color: "#fff" },
  portalIcon: { fontSize: "2.5rem", marginBottom: "1rem" },
  portalTitle: { fontFamily: "'Fraunces',sans-serif", fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.4rem" },
  portalSub: { fontSize: "0.88rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.75rem" },
  portalUser: { fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: "1.2rem" },
  portalInput: { width: "100%", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff", fontSize: "1rem", fontFamily: "'Inter',sans-serif", outline: "none", textAlign: "center", boxSizing: "border-box", marginBottom: "0.75rem" },
  portalBtn: { width: "100%", padding: "0.85rem", background: "linear-gradient(135deg,#2f8f6f,#4fceae)", border: "none", borderRadius: 50, color: "#fff", fontFamily: "'Fraunces',sans-serif", fontWeight: 700, fontSize: "1rem", cursor: "pointer", marginBottom: "0.75rem" },
  logoutSmall: { background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", fontSize: "0.82rem", cursor: "pointer" },
  dashRoot: { minHeight: "100vh", background: "#0a0e1a", display: "flex", fontFamily: "'Inter',sans-serif", color: "#fff", position: "relative", overflow: "hidden" },
  orb1Dash: { width: 500, height: 500, background: "radial-gradient(circle,#2f8f6f,transparent)", bottom: -150, right: -150 },
  orb2Dash: { width: 400, height: 400, background: "radial-gradient(circle,#b8863a,transparent)", top: -100, left: -100 },
  sidebar: { width: 260, flexShrink: 0, background: "rgba(255,255,255,0.03)", borderRight: "1px solid rgba(255,255,255,0.07)", padding: "1.5rem 1.2rem", display: "flex", flexDirection: "column", position: "relative", zIndex: 2, minHeight: "100vh" },
  sideTop: { textAlign: "center", paddingBottom: "1.2rem", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: "1.2rem" },
  sideLogoTxt: { fontFamily: "'Fraunces',sans-serif", fontWeight: 800, fontSize: "1.1rem", background: "linear-gradient(135deg,#e8c073,#4fceae)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "1rem" },
  avatar: { width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,#2f8f6f,#4fceae)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces',sans-serif", fontWeight: 800, fontSize: "1.5rem", margin: "0 auto 0.75rem" },
  sidebarName: { fontFamily: "'Fraunces',sans-serif", fontSize: "1rem", fontWeight: 700, marginBottom: "0.2rem" },
  sidebarEmail: { fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" },
  sideInfo: { padding: "1rem 0", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: "1rem" },
  portalBadge: { background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: 12, padding: "0.8rem", marginBottom: "1rem" },
  badgeLabel: { fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.2rem" },
  badgeId: { fontSize: "0.82rem", color: "#4fceae", fontFamily: "monospace", fontWeight: 600 },
  badgeJob: { fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: "0.2rem" },
  sideNav: { display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "auto" },
  sideBtn: { padding: "0.6rem 1rem", background: "transparent", border: "1px solid transparent", borderRadius: 10, color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", cursor: "pointer", textAlign: "left", fontFamily: "'Inter',sans-serif" },
  sideBtnActive: { background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#4fceae" },
  logoutBtn: { marginTop: "1.5rem", padding: "0.6rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10, color: "#eeb0aa", fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Inter',sans-serif" },
  mainPanel: { flex: 1, padding: "2rem", overflowY: "auto", position: "relative", zIndex: 2 },
  dashHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" },
  dashTitle: { fontFamily: "'Fraunces',sans-serif", fontSize: "1.8rem", fontWeight: 800 },
  dashSub: { color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", marginTop: "0.3rem" },
  scoreChip: { background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 16, padding: "0.75rem 1.2rem", textAlign: "center" },
  scoreChipNum: { fontFamily: "'Fraunces',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#4fceae", display: "block" },
  scoreChipLabel: { fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" },
  analyzeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" },
  glassCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "1.5rem" },
  cardTitle: { fontFamily: "'Fraunces',sans-serif", fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" },
  textarea: { width: "100%", minHeight: 160, padding: "0.85rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: "0.88rem", fontFamily: "'Inter',sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box" },
  uploadLabel: { cursor: "pointer", display: "block" },
  uploadBox: { border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 12, padding: "2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1rem" },
  calcBtn: { width: "100%", padding: "0.85rem", background: "linear-gradient(135deg,#2f8f6f,#4fceae)", border: "none", borderRadius: 50, color: "#fff", fontFamily: "'Fraunces',sans-serif", fontWeight: 700, fontSize: "1rem", cursor: "pointer" },
  resultsGrid: { display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "1.5rem" },
  biasBox: { flex: 1, minWidth: 180 },
  // NLP Analysis card
  nlpSection: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "1.25rem 1.4rem", marginTop: "1.2rem" },
  nlpHeaderRow: { display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.1rem" },
  nlpTitleBadge: { fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", color: "#e8c073", background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 6, padding: "2px 7px" },
  nlpTitle: { fontFamily: "'Fraunces',sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "#fff", margin: 0 },
  nlpMetricRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" },
  nlpMetricItem: {},
  nlpMetricTop: { display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" },
  nlpMetricLabel: { fontSize: "0.78rem", color: "rgba(255,255,255,0.5)" },
  nlpMetricVal: { fontSize: "0.82rem", fontFamily: "'Fraunces',sans-serif", fontWeight: 700 },
  barTrack: { height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 99, animation: "barGrow 0.9s cubic-bezier(0.22,1,0.36,1) both" },
  topSkillsBlock: { borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" },
  topSkillsLabel: { fontSize: "0.76rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.6rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" },
  termsWrap: { display: "flex", flexWrap: "wrap" },
  // History
  historySection: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "1.5rem" },
  histRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap", gap: "0.5rem" },
  histDate: { fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.25rem" },
  histPortal: { fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" },
  histScores: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
  histBadge: { padding: "4px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600 },
};

export default CandidateDashboard;