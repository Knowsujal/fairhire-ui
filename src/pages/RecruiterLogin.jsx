import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RecruiterLogin.css";

export default function RecruiterLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "recruiter@fairhire.com" && password === "123456") {
      navigate("/recruiter-dashboard");
    } else {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">

        <div className="login-icon">📄</div>

        <h1>FairHire Recruiter</h1>
        <p className="subtitle">Sign in to your account</p>

        <div className="demo-box">
          <strong>Demo Credentials</strong>
          <p>Email: recruiter@fairhire.com</p>
          <p>Password: 123456</p>
        </div>

        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="recruiter@fairhire.com"
            required
          />

          <label>Password</label>
          <div className="password-box">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="123456"
              required
            />
            <span onClick={() => setShow(!show)}>👁</span>
          </div>

          <button type="submit">Sign in to Dashboard</button>
        </form>


        <footer>© 2026 FairHire</footer>

      </div>
    </div>
  );
}
