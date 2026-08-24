

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Landing.css";
 
const WORDS = ["Talent.", "Skills.", "Potential.", "Merit."];
 
const stats = [
  { value: "98%", label: "Bias Removed" },
  { value: "3x", label: "Faster Screening" },
  { value: "10k+", label: "Resumes Analyzed" },
  { value: "500+", label: "Recruiters Trust Us" },
];
 
const features = [
  {
    icon: "⚡",
    title: "ATS Score Engine",
    desc: "Instantly matches resume keywords against job descriptions with precision scoring.",
  },
  {
    icon: "🛡️",
    title: "Bias Detection",
    desc: "Strips name, gender, age, location and college bias for fair evaluation.",
  },
  {
    icon: "📊",
    title: "Recruiter Dashboard",
    desc: "Real-time candidate pipeline with shortlist, reject and score tracking.",
  },
  {
    icon: "🔗",
    title: "Portal System",
    desc: "Unique portal IDs link candidates directly to the right recruiter.",
  },
  {
    icon: "📁",
    title: "Resume Parsing",
    desc: "Extracts text from PDF resumes automatically with high accuracy.",
  },
  {
    icon: "🕒",
    title: "History Tracking",
    desc: "Full audit trail of every submission, score and status change.",
  },
];
 
const steps = [
  { num: "01", title: "Recruiter Registers", desc: "Creates an account and gets a unique Portal ID for their job opening." },
  { num: "02", title: "Candidate Applies", desc: "Enters the Portal ID, uploads their resume and pastes the job description." },
  { num: "03", title: "AI Scores Resume", desc: "FairHire calculates ATS score and a separate bias-free score instantly." },
  { num: "04", title: "Recruiter Reviews", desc: "Views all candidates ranked by score and updates their status." },
];
 
export default function Landing() {
  const navigate = useNavigate();
  const [wordIdx, setWordIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const heroRef = useRef(null);
 
  useEffect(() => {
    setVisible(true);
    const interval = setInterval(() => {
      setWordIdx(i => (i + 1) % WORDS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
 
  return (
    <div className="lp-root">
      {/* ── NAV ── */}
      <nav className="lp-nav">
        <div className="lp-nav-logo">
          <span className="lp-logo-icon">⚖️</span>
          <span className="lp-logo-text">FairHire</span>
        </div>
        <div className="lp-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <button className="lp-nav-cta" onClick={() => navigate("/role")}>Get Started</button>
        </div>
      </nav>
 
      {/* ── HERO ── */}
      <section className={`lp-hero ${visible ? "lp-hero--in" : ""}`} ref={heroRef}>
        <div className="lp-hero-bg">
          <div className="lp-orb lp-orb1" />
          <div className="lp-orb lp-orb2" />
          <div className="lp-orb lp-orb3" />
          <div className="lp-grid-lines" />
        </div>
 
        <div className="lp-hero-content">
          <div className="lp-badge">🚀 AI-Powered Resume Screening</div>
          <h1 className="lp-hero-h1">
            Hiring
            <span className="lp-word-swap"> {WORDS[wordIdx]}</span>
            <br />Not Identity.
          </h1>
          <p className="lp-hero-sub">
            FairHire scores resumes on skills and removes bias from name, gender,
            location and college — so the best candidate always wins.
          </p>
          <div className="lp-hero-btns">
            <button className="lp-btn-primary" onClick={() => navigate("/role")}>
              Start for Free →
            </button>
            <button className="lp-btn-ghost" onClick={() => navigate("/recruiter-dashboard")}>
              Recruiter Login
            </button>
          </div>
        </div>
 
        {/* Floating score card */}
        <div className="lp-float-card lp-float-card1">
          <div className="lp-float-label">ATS Score</div>
          <div className="lp-float-score lp-float-score--ats">87%</div>
          <div className="lp-float-bar"><div className="lp-float-fill lp-float-fill--ats" style={{width:"87%"}} /></div>
        </div>
        <div className="lp-float-card lp-float-card2">
          <div className="lp-float-label">Bias-Free Score</div>
          <div className="lp-float-score lp-float-score--bias">94%</div>
          <div className="lp-float-bar"><div className="lp-float-fill lp-float-fill--bias" style={{width:"94%"}} /></div>
        </div>
        <div className="lp-float-card lp-float-card3">
          <span className="lp-float-dot lp-dot--green" />
          <span>Candidate Shortlisted</span>
        </div>
      </section>
 
      {/* ── STATS ── */}
      <section className="lp-stats">
        {stats.map((s, i) => (
          <div className="lp-stat-item" key={i} style={{animationDelay: `${i * 0.1}s`}}>
            <div className="lp-stat-value">{s.value}</div>
            <div className="lp-stat-label">{s.label}</div>
          </div>
        ))}
      </section>
 
      {/* ── FEATURES ── */}
      <section className="lp-section" id="features">
        <div className="lp-section-tag">Features</div>
        <h2 className="lp-section-h2">Everything you need for<br />fair, fast hiring</h2>
        <div className="lp-features-grid">
          {features.map((f, i) => (
            <div className="lp-feature-card" key={i} style={{animationDelay: `${i * 0.08}s`}}>
              <div className="lp-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
 
      {/* ── HOW IT WORKS ── */}
      <section className="lp-section lp-section--dark" id="how">
        <div className="lp-section-tag lp-section-tag--light">How it works</div>
        <h2 className="lp-section-h2 lp-section-h2--light">From application to<br />decision in minutes</h2>
        <div className="lp-steps">
          {steps.map((s, i) => (
            <div className="lp-step" key={i}>
              <div className="lp-step-num">{s.num}</div>
              <div className="lp-step-line" />
              <h3 className="lp-step-title">{s.title}</h3>
              <p className="lp-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
 
      {/* ── CTA ── */}
      <section className="lp-cta">
        <div className="lp-cta-orb" />
        <h2>Ready to hire fairly?</h2>
        <p>Join hundreds of recruiters using FairHire to build better teams.</p>
        <div className="lp-hero-btns">
          <button className="lp-btn-primary" onClick={() => navigate("/role")}>
            Get Started Free →
          </button>
          <button className="lp-btn-ghost" onClick={() => navigate("/recruiter-dashboard")}>
            Recruiter Login
          </button>
        </div>
      </section>
 
      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <span>⚖️ FairHire</span>
        <span>Hiring talent, not identity.</span>
        <span>© 2026</span>
      </footer>
    </div>
  );
}