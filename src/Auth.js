import { useState } from "react";
import { useNavigate } from "react-router-dom";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(var(--r)); }
    50% { transform: translateY(-10px) rotate(var(--r)); }
  }

  .fade-up { animation: fadeUp 0.5s ease both; }
  .fade-up-1 { animation-delay: 0.08s; }
  .fade-up-2 { animation-delay: 0.16s; }
  .fade-up-3 { animation-delay: 0.24s; }
  .fade-up-4 { animation-delay: 0.32s; }

  .gold-shimmer {
    background: linear-gradient(90deg, #c9a84c, #f0d080, #c9a84c);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }

  .auth-input {
    width: 100%;
    padding: 13px 16px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    font-family: 'Montserrat', sans-serif;
    font-size: 14px;
    font-weight: 300;
    color: #e8e0d0;
    transition: border-color 0.2s, background 0.2s;
    outline: none;
  }
  .auth-input:focus {
    border-color: rgba(201,168,76,0.5);
    background: rgba(255,255,255,0.06);
  }
  .auth-input::placeholder { color: rgba(232,224,208,0.25); }

  .cta-btn {
    cursor: pointer; border: none;
    transition: all 0.2s ease;
  }
  .cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(201,168,76,0.4) !important;
  }
  .cta-btn:active { transform: translateY(0); }

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

  .nav-link { cursor: pointer; transition: color 0.2s; }
  .nav-link:hover { color: #c9a84c !important; }

  .toggle-link {
    cursor: pointer;
    transition: color 0.2s;
    background: none; border: none;
    font-family: 'Montserrat', sans-serif;
  }
  .toggle-link:hover { color: #f0d080 !important; }

  .forgot-link {
    cursor: pointer; background: none; border: none;
    font-family: 'Montserrat', sans-serif;
    transition: color 0.2s;
  }
  .forgot-link:hover { color: #f0d080 !important; }

  .cover-float {
    animation: float var(--dur) ease-in-out infinite;
    animation-delay: var(--delay);
  }

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

const covers = [
  { seed: "empress", r: "-6deg", x: 60, y: 30, w: 110, h: 155, dur: "4s", delay: "0s" },
  { seed: "villainess", r: "8deg", x: 180, y: 0, w: 100, h: 142, dur: "5s", delay: "0.6s" },
  { seed: "business", r: "-3deg", x: 20, y: 160, w: 105, h: 148, dur: "4.5s", delay: "1.2s" },
  { seed: "tyrant", r: "10deg", x: 200, y: 150, w: 95, h: 135, dur: "3.8s", delay: "0.3s" },
];

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // login | register
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 1400);
  };

  const switchMode = (m) => {
    setMode(m);
    setErrors({});
    setForm({ name: "", email: "", password: "", confirmPassword: "" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#e8e0d0", fontFamily: "'Montserrat', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{css}</style>

      {/* Ambient orbs */}
      <div style={{ position: "fixed", top: -200, right: -100, width: 600, height: 600, borderRadius: "50%", background: "rgba(100,60,160,0.1)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(201,168,76,0.06)", filter: "blur(80px)", pointerEvents: "none" }} />

      {/* Header */}
      <header style={{ padding: "0 5%", borderBottom: "1px solid rgba(201,168,76,0.1)", background: "rgba(8,8,16,0.9)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => navigate("/")}>
            <div style={{ width: 30, height: 30, background: "linear-gradient(135deg, #c9a84c, #8a6020)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⬡</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700 }}>KOKORO</span>
            <span style={{ fontSize: 9, fontWeight: 300, letterSpacing: "0.25em", color: "#c9a84c", textTransform: "uppercase" }}>MANHWA</span>
          </div>
          <span className="nav-link" style={{ fontSize: 12, color: "rgba(232,224,208,0.4)", fontWeight: 300 }} onClick={() => navigate("/")}>← Нүүр</span>
        </div>
      </header>

      {/* Main */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 5%", gap: 60, alignItems: "center", minHeight: "calc(100vh - 60px)" }}>

        {/* Left — decorative */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <div style={{ fontSize: 10, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>✦ Kokoro Manhwa</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
              Your Story<br />
              <span className="gold-shimmer">Awaits You.</span>
            </h2>
            <p style={{ fontSize: 14, fontWeight: 300, color: "rgba(232,224,208,0.5)", lineHeight: 1.8, maxWidth: 380 }}>
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
                <span style={{ color: "#c9a84c", fontSize: 10, marginTop: 4, flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: 13, fontWeight: 300, color: "rgba(232,224,208,0.55)", lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(140,80,40,0.08))", borderRadius: 12, padding: "28px", border: "1px solid rgba(201,168,76,0.15)", position: "relative", overflow: "hidden", marginTop: 8 }}>
            <div style={{ fontSize: 60, color: "rgba(201,168,76,0.1)", fontFamily: "Playfair Display", position: "absolute", top: -8, left: 16, lineHeight: 1 }}>"</div>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: 16, fontStyle: "italic", color: "rgba(232,224,208,0.75)", lineHeight: 1.8, position: "relative", zIndex: 1, marginBottom: 14 }}>
              Бидэнтэй нэгдсэнд баярлалаа.
            </p>
          </div>
        </div>

        {/* Right — Auth form */}
        <div>
          <div className="fade-up" style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: "40px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          }}>
            {/* Tab switcher */}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 4, marginBottom: 32, border: "1px solid rgba(255,255,255,0.07)" }}>
              {[["login", "Нэвтрэх"], ["register", "Бүртгүүлэх"]].map(([val, label]) => (
                <button key={val} className="tab-btn" onClick={() => switchMode(val)} style={{
                  flex: 1, padding: "10px",
                  borderRadius: 6, fontSize: 13,
                  fontFamily: "'Montserrat'", fontWeight: mode === val ? 500 : 300,
                  color: mode === val ? "#080810" : "rgba(232,224,208,0.4)",
                  background: mode === val ? "linear-gradient(135deg, #c9a84c, #8a6020)" : "transparent",
                  letterSpacing: "0.05em",
                  boxShadow: mode === val ? "0 4px 14px rgba(201,168,76,0.3)" : "none",
                  transition: "all 0.25s ease",
                }}>{label}</button>
              ))}
            </div>

            <div className="fade-up fade-up-1">
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
                {mode === "login" ? "Тавтай Морил" : "Join Kokoro"}
              </h3>
              <p style={{ fontSize: 13, fontWeight: 300, color: "rgba(232,224,208,0.4)", marginBottom: 28 }}>
</p>
            </div>

            {/* Social login */}
            <div className="fade-up fade-up-2" style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              {[["G", "Google", "#4285f4"], ["F", "Facebook", "#1877f2"]].map(([icon, label, color]) => (
                <button key={label} className="social-btn" style={{
                  flex: 1, padding: "11px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  color: "rgba(232,224,208,0.6)",
                  fontFamily: "'Montserrat'", fontSize: 13, fontWeight: 400,
                }}>
                  <span style={{ fontWeight: 700, color, fontSize: 15 }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="fade-up fade-up-2" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              <span style={{ fontSize: 11, color: "rgba(232,224,208,0.25)", fontWeight: 300, letterSpacing: "0.1em" }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* Form fields */}
            <div className="fade-up fade-up-3" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {mode === "register" && (
                <div>
                  <label style={{ fontSize: 11, color: "rgba(232,224,208,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>НЭР</label>
                  <input className="auth-input" placeholder="Таны нэр" value={form.name} onChange={e => update("name", e.target.value)} />
                  {errors.name && <p style={{ fontSize: 11, color: "#e07070", marginTop: 5, fontWeight: 300 }}>{errors.name}</p>}
                </div>
              )}

              <div>
                <label style={{ fontSize: 11, color: "rgba(232,224,208,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>ИМЭЙЛ ХАЯГ</label>
                <input className="auth-input" type="email" placeholder="example@gmail.com" value={form.email} onChange={e => update("email", e.target.value)} />
                {errors.email && <p style={{ fontSize: 11, color: "#e07070", marginTop: 5, fontWeight: 300 }}>{errors.email}</p>}
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <label style={{ fontSize: 11, color: "rgba(232,224,208,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 400 }}>НУУЦ ҮГ</label>
                  {mode === "login" && (
                    <button className="forgot-link" style={{ fontSize: 11, color: "#c9a84c", fontWeight: 300 }}>Нууц үг мартсан уу?</button>
                  )}
                </div>
                <div style={{ position: "relative" }}>
                  <input className="auth-input" type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={e => update("password", e.target.value)} style={{ paddingRight: 44 }} />
                  <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(232,224,208,0.3)", fontSize: 13, padding: 0 }}>
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && <p style={{ fontSize: 11, color: "#e07070", marginTop: 5, fontWeight: 300 }}>{errors.password}</p>}
              </div>

              {mode === "register" && (
                <div>
                  <label style={{ fontSize: 11, color: "rgba(232,224,208,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Confirm НУУЦ ҮГ</label>
                  <input className="auth-input" type={showPass ? "text" : "password"} placeholder="••••••••" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} />
                  {errors.confirmPassword && <p style={{ fontSize: 11, color: "#e07070", marginTop: 5, fontWeight: 300 }}>{errors.confirmPassword}</p>}
                </div>
              )}

              {/* Remember me / Terms */}
              {mode === "login" ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }} onClick={() => setRememberMe(!rememberMe)}>
                  <div className={`checkbox-custom ${rememberMe ? "checked" : ""}`}>
                    {rememberMe && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#080810" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(232,224,208,0.45)", fontWeight: 300, cursor: "pointer" }}>Намайг сана</span>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }} onClick={() => setAgreeTerms(!agreeTerms)}>
                    <div className={`checkbox-custom ${agreeTerms ? "checked" : ""}`} style={{ marginTop: 2 }}>
                      {agreeTerms && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#080810" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                    </div>
                    <span style={{ fontSize: 12, color: "rgba(232,224,208,0.45)", fontWeight: 300, cursor: "pointer", lineHeight: 1.6 }}>
                      Би зөвшөөрч байна <span style={{ color: "#c9a84c" }}>Үйлчилгээний нөхцөл</span> and <span style={{ color: "#c9a84c" }}>Нууцлалын бодлого</span>
                    </span>
                  </div>
                  {errors.terms && <p style={{ fontSize: 11, color: "#e07070", marginTop: 5, fontWeight: 300 }}>{errors.terms}</p>}
                </div>
              )}
            </div>

            {/* Submit button */}
            <div className="fade-up fade-up-4" style={{ marginTop: 24 }}>
              <button className="cta-btn" onClick={handleSubmit} style={{
                width: "100%", padding: "14px",
                background: loading ? "rgba(201,168,76,0.5)" : "linear-gradient(135deg, #c9a84c, #8a6020)",
                color: "#080810", borderRadius: 6,
                fontSize: 13, fontFamily: "'Montserrat'",
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

              <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "rgba(232,224,208,0.35)", fontWeight: 300 }}>
                {mode === "login" ? "Бүртгэлгүй юу? " : "Аль хэдийн бүртгэлтэй юу? "}
                <button className="toggle-link" onClick={() => switchMode(mode === "login" ? "register" : "login")} style={{ color: "#c9a84c", fontSize: 13, fontWeight: 400 }}>
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