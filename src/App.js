import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import RoleSelect from "./pages/RoleSelect";

import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterLogin from "./pages/RecruiterLogin";

import CandidateLogin from "./pages/CandidateLogin";
import CandidateDashboard from "./pages/CandidateDashboard"; // ✅ missing import fixed

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing */}
        <Route path="/" element={<Landing />} />
        <Route path="/role" element={<RoleSelect />} />

        {/* Recruiter Flow */}
        <Route path="/recruiter-login" element={<RecruiterLogin />} />
        <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />

        {/* Candidate Flow */}
        <Route path="/candidate-login" element={<CandidateLogin />} />
        <Route path="/candidate-dashboard" element={<CandidateDashboard />} />

        {/* Temporary Test Routes */}
        <Route path="/recruiter" element={<h1>Recruiter Page Works</h1>} />
        <Route path="/candidate" element={<h1>Candidate Page Works</h1>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
