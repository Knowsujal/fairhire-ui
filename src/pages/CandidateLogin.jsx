import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const CandidateLogin = () => {
  const [view, setView] = useState("login");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [regData, setRegData] = useState({ name:"", email:"", password:"", confirmPassword:"", phone:"", college:"", degree:"", skills:"" });

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const handleLogin = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/candidate/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Login failed");
      localStorage.setItem("candidateUser", JSON.stringify(data.user));
      navigate("/candidate-dashboard");
    } catch { setError("Cannot connect to server"); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setError("");
    if (regData.password !== regData.confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/candidate/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData)
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Registration failed");
      localStorage.setItem("candidateUser", JSON.stringify(data.user));
      navigate("/candidate-dashboard");
    } catch { setError("Cannot connect to server"); }
    finally { setLoading(false); }
  };

  return (
    <div style={s.root}>
      <div style={{...s.orb,...s.orb1}}/><div style={{...s.orb,...s.orb2}}/><div style={s.grid}/>
      <button style={s.back} onClick={() => navigate("/role")}>← Back</button>
      <div style={{...s.card, opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(30px)"}}>
        <div style={s.iconWrap}>🎯</div>
        <h2 style={s.title}>{view==="login"?"Welcome Back":"Create Account"}</h2>
        <p style={s.sub}>{view==="login"?"Login to your candidate profile":"Join FairHire as a candidate"}</p>
        <div style={s.tabs}>
          <button style={view==="login"?{...s.tab,...s.tabActive}:s.tab} onClick={()=>{setView("login");setError("");}}>Login</button>
          <button style={view==="register"?{...s.tab,...s.tabActive}:s.tab} onClick={()=>{setView("register");setError("");}}>Register</button>
        </div>
        {error && <div style={s.errorBox}>{error}</div>}

        {view==="login" && (
          <form onSubmit={handleLogin} style={s.form}>
            <Field label="Email" type="email" placeholder="your@email.com" value={loginData.email} onChange={v=>setLoginData({...loginData,email:v})} color="#4fceae"/>
            <Field label="Password" type="password" placeholder="••••••••" value={loginData.password} onChange={v=>setLoginData({...loginData,password:v})} color="#4fceae"/>
            <Btn loading={loading} color="linear-gradient(135deg,#2f8f6f,#4fceae)">Login →</Btn>
          </form>
        )}

        {view==="register" && (
          <form onSubmit={handleRegister} style={s.form}>
            <div style={s.row}>
              <Field label="Full Name" placeholder="John Doe" value={regData.name} onChange={v=>setRegData({...regData,name:v})} color="#4fceae"/>
              <Field label="Email" type="email" placeholder="your@email.com" value={regData.email} onChange={v=>setRegData({...regData,email:v})} color="#4fceae"/>
            </div>
            <div style={s.row}>
              <Field label="Password" type="password" placeholder="••••••••" value={regData.password} onChange={v=>setRegData({...regData,password:v})} color="#4fceae"/>
              <Field label="Confirm Password" type="password" placeholder="••••••••" value={regData.confirmPassword} onChange={v=>setRegData({...regData,confirmPassword:v})} color="#4fceae"/>
            </div>
            <div style={s.row}>
              <Field label="Phone" placeholder="9876543210" value={regData.phone} onChange={v=>setRegData({...regData,phone:v})} color="#4fceae"/>
              <Field label="College" placeholder="Your University" value={regData.college} onChange={v=>setRegData({...regData,college:v})} color="#4fceae"/>
            </div>
            <div style={s.row}>
              <Field label="Degree" placeholder="B.Tech CSE" value={regData.degree} onChange={v=>setRegData({...regData,degree:v})} color="#4fceae"/>
              <Field label="Skills" placeholder="React, Java, SQL" value={regData.skills} onChange={v=>setRegData({...regData,skills:v})} color="#4fceae"/>
            </div>
            <Btn loading={loading} color="linear-gradient(135deg,#2f8f6f,#4fceae)">Create Account →</Btn>
          </form>
        )}
        <p style={s.footNote}>
          {view==="login"?"No account? ":"Have account? "}
          <span style={s.link} onClick={()=>{setView(view==="login"?"register":"login");setError("");}}>
            {view==="login"?"Register here":"Login here"}
          </span>
        </p>
      </div>
    </div>
  );
};

const Field = ({label,type="text",placeholder,value,onChange,color}) => {
  const [focused,setFocused]=useState(false);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5,flex:1,minWidth:0}}>
      <label style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)",fontWeight:500}}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{padding:"0.7rem 0.9rem",background:focused?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.05)",border:`1px solid ${focused?color:"rgba(255,255,255,0.1)"}`,borderRadius:10,color:"#fff",fontSize:"0.88rem",fontFamily:"'Inter',sans-serif",outline:"none",width:"100%",boxSizing:"border-box",transition:"all 0.2s"}}/>
    </div>
  );
};

const Btn = ({children,loading,color}) => {
  const [hov,setHov]=useState(false);
  return (
    <button type="submit" disabled={loading} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{padding:"0.85rem",background:color,border:"none",borderRadius:50,color:"#fff",fontSize:"1rem",fontFamily:"'Fraunces',sans-serif",fontWeight:700,cursor:loading?"not-allowed":"pointer",marginTop:"0.5rem",opacity:hov||loading?0.85:1,transform:hov?"translateY(-2px)":"none",transition:"all 0.2s",width:"100%"}}>
      {loading?"Please wait...":children}
    </button>
  );
};

const s = {
  root:{minHeight:"100vh",background:"#0a0e1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",position:"relative",overflow:"hidden",padding:"2rem"},
  orb:{position:"absolute",borderRadius:"50%",filter:"blur(90px)",opacity:0.3,pointerEvents:"none"},
  orb1:{width:450,height:450,background:"radial-gradient(circle,#2f8f6f,transparent)",bottom:-100,right:-100},
  orb2:{width:350,height:350,background:"radial-gradient(circle,#b8863a,transparent)",top:-80,left:-80},
  grid:{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none"},
  back:{position:"fixed",top:"1.5rem",left:"2rem",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.6)",padding:"0.45rem 1.1rem",borderRadius:50,fontSize:"0.85rem",cursor:"pointer",zIndex:10,fontFamily:"'Inter',sans-serif"},
  card:{position:"relative",zIndex:2,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:28,padding:"2.2rem",width:"100%",maxWidth:560,transition:"opacity 0.8s ease,transform 0.8s ease",color:"#fff"},
  iconWrap:{width:56,height:56,background:"linear-gradient(135deg,rgba(5,150,105,0.3),rgba(5,150,105,0.1))",border:"1px solid rgba(52,211,153,0.25)",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.6rem",marginBottom:"1rem"},
  title:{fontFamily:"'Fraunces',sans-serif",fontSize:"1.8rem",fontWeight:800,marginBottom:"0.3rem"},
  sub:{fontSize:"0.88rem",color:"rgba(255,255,255,0.4)",marginBottom:"1.2rem"},
  tabs:{display:"flex",background:"rgba(255,255,255,0.04)",borderRadius:12,padding:4,marginBottom:"1.2rem",gap:4},
  tab:{flex:1,padding:"0.5rem",background:"transparent",border:"none",color:"rgba(255,255,255,0.4)",borderRadius:10,cursor:"pointer",fontSize:"0.9rem",fontFamily:"'Inter',sans-serif",transition:"all 0.2s"},
  tabActive:{background:"rgba(52,211,153,0.15)",color:"#4fceae",border:"1px solid rgba(52,211,153,0.2)"},
  errorBox:{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#eeb0aa",padding:"0.6rem 1rem",borderRadius:10,fontSize:"0.82rem",marginBottom:"1rem"},
  form:{display:"flex",flexDirection:"column",gap:"0.75rem"},
  row:{display:"flex",gap:"0.75rem"},
  footNote:{fontSize:"0.8rem",color:"rgba(255,255,255,0.3)",textAlign:"center",marginTop:"1rem"},
  link:{color:"#4fceae",cursor:"pointer",textDecoration:"underline"},
};

export default CandidateLogin;