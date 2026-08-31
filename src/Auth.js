import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useWindowSize from "./useWindowSize";
import Header from "./components/Header";
import { FONT_IMPORT, baseCss } from "./sharedStyles";
import { signIn, signUp, signInWithOAuth } from "./lib/auth";

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

  .social-btn {
    cursor: pointer;
    transition: all 0.2s;
  }
  .social-btn:hover {
    background: rgba(255,255,255,0.07) !important;
    border-color: rgba(201,168,76,0.3) !important;
  }

  .tab-btn {
    cursor: pointer; border: none;
    transition: all 0.2s;
  }

  .toggle-link {
    cursor: pointer;
    transition: color 0.2s;
    background: none; border: none;
    font-family: 'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif;
  }
  .toggle-link:hover { color: #f0d080 !important; }

  .forgot-link {
    cursor: pointer; background: none; border: none;
    font-family: 'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif;
    transition: color 0.2s;
  }
  .forgot-link:hover { color: #f0d080 !important; }

  .checkbox-custom {
    width: 16px; height: 16px;
    border: 1px solid rgba(201,168,76,0.3);
    border-radius: 3px;
    background: rgba(255,255,255,0.04);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .checkbox-custom.checked {
    background: linear-gradient(135deg, #c9a84c, #8a6020);
    border-color: transparent;
  }
`;

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // login | register
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const width = useWindowSize();
  const isMobile = width < 768;

  const update = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (mode === "register" && !form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Нууц үг оруулна уу";
    else if (form.password.length < 6) e.password = "At least 6 characters";
    if (mode === "register" && form.password !== form.confirmPassword) e.confirmPassword = "Нууц үг таарахгүй байна";
    if (mode === "register" && !agreeTerms) e.terms = "You must agree to continue";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn({ email: form.email, password: form.password });
      } else {
        await signUp({ email: form.email, password: form.password, username: form.name });
      }
      navigate("/");
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    setErrors({});
    try {
      await signInWithOAuth(provider);
      // signInWithOAuth redirects the whole page to the provider, so nothing
      // else runs here on success — this only executes if it fails to even
      // start the redirect (e.g. the provider isn't enabled in Supabase yet).
    } catch (err) {
      setErrors({ form: err.message });
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setErrors({});
    setForm({ name: "", email: "", password: "", confirmPassword: "" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#f7f3ea", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{css}</style>

      {/* Ambient orbs */}
      <div style={{ position: "fixed", top: -200, right: -100, width: 600, height: 600, borderRadius: "50%", background: "rgba(100,60,160,0.1)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(201,168,76,0.06)", filter: "blur(80px)", pointerEvents: "none" }} />

      <Header />

      {/* Main */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", maxWidth: 1100, margin: "0 auto", width: "100%", padding: isMobile ? "32px 5%" : "0 5%", gap: isMobile ? 32 : 60, alignItems: "center", minHeight: isMobile ? "auto" : "calc(100vh - 60px)" }}>

        {/* Left — decorative (hidden on mobile to keep the form above the fold) */}
        {!isMobile && (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <div style={{ fontSize: 12, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>✦ Kokoro Manhwa</div>
            <h2 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 42, fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
              Your Story<br />
              <span className="gold-shimmer">Awaits You.</span>
            </h2>
            <p style={{ fontSize: 15, fontWeight: 400, color: "rgba(247,243,234,0.5)", lineHeight: 1.8, maxWidth: 380 }}>
              Монгол хэлээр хамгийн гоё romance манхваг эндээс. Бүртгүүлээд уншилтын аяллаа одооноос эхлүүлээрэй!
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["✦", "Bookmark your favorites and pick up where you left off"],
              ["✦", "Get notified the moment new chapters drop"],
              ["✦", "Join the community and share your reactions"],
            ].map(([icon, text], i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ color: "#c9a84c", fontSize: 12, marginTop: 4, flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(247,243,234,0.55)", lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(140,80,40,0.08))", borderRadius: 12, padding: "28px", border: "1px solid rgba(201,168,76,0.15)", position: "relative", overflow: "hidden", marginTop: 8 }}>
            <div style={{ fontSize: 60, color: "rgba(201,168,76,0.1)", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", position: "absolute", top: -8, left: 16, lineHeight: 1 }}>"</div>
            <p style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 17, fontStyle: "italic", color: "rgba(247,243,234,0.75)", lineHeight: 1.8, position: "relative", zIndex: 1, marginBottom: 14 }}>
              Бидэнтэй нэгдсэнд баярлалаа.
            </p>
          </div>
        </div>
        )}

        {/* Right — Auth form */}
        <div>
          <div className="fade-up" style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: isMobile ? "28px 22px" : "40px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          }}>
            {/* Tab switcher */}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 4, marginBottom: 32, border: "1px solid rgba(255,255,255,0.07)" }}>
              {[["login", "Нэвтрэх"], ["register", "Бүртгүүлэх"]].map(([val, label]) => (
                <button key={val} className="tab-btn" onClick={() => switchMode(val)} style={{
                  flex: 1, padding: "10px",
                  borderRadius: 6, fontSize: 14,
                  fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: mode === val ? 500 : 300,
                  color: mode === val ? "#080810" : "rgba(247,243,234,0.4)",
                  background: mode === val ? "linear-gradient(135deg, #c9a84c, #8a6020)" : "transparent",
                  letterSpacing: "0.05em",
                  boxShadow: mode === val ? "0 4px 14px rgba(201,168,76,0.3)" : "none",
                  transition: "all 0.25s ease",
                }}>{label}</button>
              ))}
            </div>

            <div className="fade-up fade-up-1">
              <h3 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 28 }}>
                {mode === "login" ? "Тавтай Морил" : "Join Kokoro"}
              </h3>
            </div>

            {/* Social login */}
            <div className="fade-up fade-up-2" style={{ marginBottom: 24 }}>
              <button className="social-btn" onClick={() => handleOAuthLogin("google")} style={{
                width: "100%", padding: "11px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                color: "rgba(247,243,234,0.75)",
                fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 14, fontWeight: 500,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google-р нэвтрэх
              </button>
            </div>

            {/* Divider */}
            <div className="fade-up fade-up-2" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              <span style={{ fontSize: 13, color: "rgba(247,243,234,0.25)", fontWeight: 400, letterSpacing: "0.1em" }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* Form fields */}
            <div className="fade-up fade-up-3" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {mode === "register" && (
                <div>
                  <label style={{ fontSize: 13, color: "rgba(247,243,234,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>НЭР</label>
                  <input className="auth-input" placeholder="Таны нэр" value={form.name} onChange={e => update("name", e.target.value)} />
                  {errors.name && <p style={{ fontSize: 13, color: "#e07070", marginTop: 5, fontWeight: 400 }}>{errors.name}</p>}
                </div>
              )}

              <div>
                <label style={{ fontSize: 13, color: "rgba(247,243,234,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>ИМЭЙЛ ХАЯГ</label>
                <input className="auth-input" type="email" placeholder="example@gmail.com" value={form.email} onChange={e => update("email", e.target.value)} />
                {errors.email && <p style={{ fontSize: 13, color: "#e07070", marginTop: 5, fontWeight: 400 }}>{errors.email}</p>}
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <label style={{ fontSize: 13, color: "rgba(247,243,234,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 400 }}>НУУЦ ҮГ</label>
                  {mode === "login" && (
                    <button className="forgot-link" style={{ fontSize: 13, color: "#c9a84c", fontWeight: 400 }}>Нууц үг мартсан уу?</button>
                  )}
                </div>
                <div style={{ position: "relative" }}>
                  <input className="auth-input" type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={e => update("password", e.target.value)} style={{ paddingRight: 44 }} />
                  <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(247,243,234,0.3)", fontSize: 14, padding: 0 }}>
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && <p style={{ fontSize: 13, color: "#e07070", marginTop: 5, fontWeight: 400 }}>{errors.password}</p>}
              </div>

              {mode === "register" && (
                <div>
                  <label style={{ fontSize: 13, color: "rgba(247,243,234,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Confirm НУУЦ ҮГ</label>
                  <input className="auth-input" type={showPass ? "text" : "password"} placeholder="••••••••" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} />
                  {errors.confirmPassword && <p style={{ fontSize: 13, color: "#e07070", marginTop: 5, fontWeight: 400 }}>{errors.confirmPassword}</p>}
                </div>
              )}

              {/* Remember me / Terms */}
              {mode === "login" ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }} onClick={() => setRememberMe(!rememberMe)}>
                  <div className={`checkbox-custom ${rememberMe ? "checked" : ""}`}>
                    {rememberMe && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#080810" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                  </div>
                  <span style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", fontWeight: 400, cursor: "pointer" }}>Намайг сана</span>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }} onClick={() => setAgreeTerms(!agreeTerms)}>
                    <div className={`checkbox-custom ${agreeTerms ? "checked" : ""}`} style={{ marginTop: 2 }}>
                      {agreeTerms && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#080810" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                    </div>
                    <span style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", fontWeight: 400, cursor: "pointer", lineHeight: 1.6 }}>
                      Би зөвшөөрч байна <span style={{ color: "#c9a84c" }}>Үйлчилгээний нөхцөл</span> and <span style={{ color: "#c9a84c" }}>Нууцлалын бодлого</span>
                    </span>
                  </div>
                  {errors.terms && <p style={{ fontSize: 13, color: "#e07070", marginTop: 5, fontWeight: 400 }}>{errors.terms}</p>}
                </div>
              )}
            </div>

            {/* Submit button */}
            <div className="fade-up fade-up-4" style={{ marginTop: 24 }}>
              {errors.form && <p style={{ fontSize: 13, color: "#e07070", marginBottom: 12, fontWeight: 400, textAlign: "center" }}>{errors.form}</p>}
              <button className="cta-btn" onClick={handleSubmit} style={{
                width: "100%", padding: "14px",
                background: loading ? "rgba(201,168,76,0.5)" : "linear-gradient(135deg, #c9a84c, #8a6020)",
                color: "#080810", borderRadius: 6,
                fontSize: 14, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif",
                fontWeight: 500, letterSpacing: "0.12em",
                textTransform: "uppercase",
                boxShadow: "0 8px 24px rgba(201,168,76,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {loading ? (
                  <>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(8,8,16,0.3)", borderTopColor: "#080810", animation: "spin 0.7s linear infinite" }} />
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  mode === "login" ? "Нэвтрэх ✦" : "Бүртгүүлэх ✦"
                )}
              </button>

              <p style={{ textAlign: "center", marginTop: 18, fontSize: 14, color: "rgba(247,243,234,0.35)", fontWeight: 400 }}>
                {mode === "login" ? "Бүртгэлгүй юу? " : "Аль хэдийн бүртгэлтэй юу? "}
                <button className="toggle-link" onClick={() => switchMode(mode === "login" ? "register" : "login")} style={{ color: "#c9a84c", fontSize: 14, fontWeight: 400 }}>
                  {mode === "login" ? "Бүртгүүлэх" : "Нэвтрэх"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}