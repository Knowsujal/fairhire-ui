import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RoleSelect.css";
const RoleSelect = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(null);
 
  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);
 
  return (
    <div className="rs-root">
      {/* Animated background */}
      <div className="rs-bg">
        <div className="rs-orb rs-orb1" />
        <div className="rs-orb rs-orb2" />
        <div className="rs-orb rs-orb3" />
        <div className="rs-grid" />
      </div>
 
      {/* Back button */}
      <button className="rs-back" onClick={() => navigate("/")}>
        ← Back
      </button>
 
      {/* Content */}
      <div className={`rs-content ${visible ? "rs-content--in" : ""}`}>
        <div className="rs-badge">⚖️ FairHire</div>
        <h1 className="rs-title">Who are you?</h1>
        <p className="rs-sub">Choose your role to get started</p>
 
        <div className="rs-cards">
 
          {/* Recruiter Card */}
          <div
            className={`rs-card rs-card--recruiter ${hovered === "recruiter" ? "rs-card--hovered" : ""}`}
            onClick={() => navigate("/recruiter-dashboard")}
            onMouseEnter={() => setHovered("recruiter")}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="rs-card-glow rs-glow--purple" />
            <div className="rs-card-icon">👔</div>
            <h2>Recruiter</h2>
            <p>Post jobs, receive applications and evaluate candidates with AI-powered ATS scoring.</p>
            <ul className="rs-card-perks">
              <li>✦ Unique Portal ID for your job</li>
              <li>✦ Live candidate pipeline</li>
              <li>✦ Shortlist & reject controls</li>
            </ul>
            <div className="rs-card-cta">
              Enter as Recruiter →
            </div>
          </div>
 
          {/* Divider */}
          <div className="rs-divider">
            <div className="rs-divider-line" />
            <span>or</span>
            <div className="rs-divider-line" />
          </div>
 
          {/* Candidate Card */}
          <div
            className={`rs-card rs-card--candidate ${hovered === "candidate" ? "rs-card--hovered" : ""}`}
            onClick={() => navigate("/candidate-dashboard")}
            onMouseEnter={() => setHovered("candidate")}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="rs-card-glow rs-glow--green" />
            <div className="rs-card-icon">🎯</div>
            <h2>Candidate</h2>
            <p>Upload your resume, enter a recruiter portal and get your ATS score instantly.</p>
            <ul className="rs-card-perks">
              <li>✦ Real-time ATS scoring</li>
              <li>✦ Bias-free evaluation</li>
              <li>✦ Submission history</li>
            </ul>
            <div className="rs-card-cta">
              Enter as Candidate →
            </div>
          </div>
 
        </div>
 
        <p className="rs-footer-note">
          No account needed to check your ATS score as a candidate.
        </p>
      </div>
    </div>
  );
};
 
export default RoleSelect;