import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./components/Header";
import { FONT_IMPORT, baseCss } from "./sharedStyles";
import { updatePassword } from "./lib/auth";
import { supabase } from "./lib/supabaseClient";

const css = `
  ${FONT_IMPORT}
  ${baseCss}

  .auth-input {
    width: 100%;
    padding: 13px 16px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    font-family: 'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif;
    font-size: 14px;
    font-weight: 300;
    color: #f7f3ea;
    transition: border-color 0.2s, background 0.2s;
    outline: none;
  }
  .auth-input:focus {
    border-color: rgba(201,168,76,0.5);
    background: rgba(255,255,255,0.06);
  }
  .auth-input::placeholder { color: rgba(247,243,234,0.25); }

  .toggle-link {
    cursor: pointer;
    transition: color 0.2s;
    background: none; border: none;
    font-family: 'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif;
  }
  .toggle-link:hover { color: #f0d080 !important; }
`;

// Reached by clicking the link in a "reset your password" email. Supabase
// parses a recovery token out of the URL and signs the user into a
// short-lived session automatically — this page just waits for that, then
// lets them set a new password with it.
export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") { setReady(true); setChecking(false); }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      setChecking(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (password.length < 6) { setError("At least 6 characters"); return; }
    if (password !== confirmPassword) { setError("Нууц үг таарахгүй байна"); return; }
    setLoading(true);
    setError("");
    try {
      await updatePassword(password);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#f7f3ea", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{css}</style>

      <div style={{ position: "fixed", top: -200, right: -100, width: 600, height: 600, borderRadius: "50%", background: "rgba(100,60,160,0.1)", filter: "blur(80px)", pointerEvents: "none" }} />

      <Header />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 5%" }}>
        <div className="fade-up" style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16, padding: "40px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          width: "100%", maxWidth: 420,
        }}>
          <h3 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 28 }}>Шинэ нууц үг</h3>

          {checking ? (
            <p style={{ fontSize: 14, color: "rgba(247,243,234,0.4)" }}>Түр хүлээнэ үү...</p>
          ) : !ready ? (
            <>
              <p style={{ fontSize: 14, color: "rgba(247,243,234,0.6)", lineHeight: 1.7, marginBottom: 20 }}>
                Энэ холбоос хүчингүй эсвэл хугацаа дууссан байна. Дахин нууц үг сэргээх хүсэлт илгээнэ үү.
              </p>
              <button className="toggle-link" onClick={() => navigate("/auth")} style={{ color: "#c9a84c", fontSize: 14, fontWeight: 400 }}>← Нэвтрэх рүү буцах</button>
            </>
          ) : done ? (
            <>
              <p style={{ fontSize: 14, color: "rgba(247,243,234,0.6)", lineHeight: 1.7, marginBottom: 20 }}>
                Нууц үг амжилттай солигдлоо.
              </p>
              <button className="cta-btn" onClick={() => navigate("/")} style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", borderRadius: 6, fontSize: 14, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>Нүүр рүү очих</button>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, color: "rgba(247,243,234,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>ШИНЭ НУУЦ ҮГ</label>
                <input className="auth-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: "rgba(247,243,234,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>ДАВТАН ОРУУЛАХ</label>
                <input className="auth-input" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              </div>
              {error && <p style={{ fontSize: 13, color: "#e07070", marginBottom: 14, fontWeight: 400 }}>{error}</p>}
              <button className="cta-btn" onClick={handleSubmit} disabled={loading} style={{
                width: "100%", padding: "14px",
                background: loading ? "rgba(201,168,76,0.5)" : "linear-gradient(135deg, #c9a84c, #8a6020)",
                color: "#080810", borderRadius: 6,
                fontSize: 14, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif",
                fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase",
                boxShadow: "0 8px 24px rgba(201,168,76,0.25)",
              }}>{loading ? "Хадгалж байна..." : "Нууц үг солих ✦"}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
