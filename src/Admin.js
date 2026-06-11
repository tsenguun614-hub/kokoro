import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── MOCK DATA ──
const MOCK_SERIES = [
  { id: 1, title: "The Remarried Empress", cover: "https://picsum.photos/seed/empress/300/420", genre: "Royal Romance", chapters: 156, status: "Ongoing", views: "2.4M", lastUpdated: "2 hours ago", active: true },
  { id: 2, title: "My Husband Hides His Beauty", cover: "https://picsum.photos/seed/husband/300/420", genre: "Fantasy Romance", chapters: 89, status: "Ongoing", views: "1.1M", lastUpdated: "5 hours ago", active: true },
  { id: 3, title: "A Business Proposal", cover: "https://picsum.photos/seed/business/300/420", genre: "Modern Romance", chapters: 128, status: "Completed", views: "1.8M", lastUpdated: "1 day ago", active: true },
  { id: 4, title: "The Villainess Reverses", cover: "https://picsum.photos/seed/villainess/300/420", genre: "Isekai Romance", chapters: 112, status: "Ongoing", views: "980K", lastUpdated: "2 days ago", active: false },
];

const STATS = [
  { label: "Total Series", value: "12", icon: "📚", change: "+2 this month" },
  { label: "Total Chapters", value: "847", icon: "📖", change: "+24 this week" },
  { label: "Total Readers", value: "24.8K", icon: "👥", change: "+1.2K this week" },
  { label: "Daily Visits", value: "3,240", icon: "📈", change: "+18% vs last week" },
];

const GENRES = ["Royal Romance", "Fantasy Romance", "Modern Romance", "Isekai Romance", "Historical Romance", "Dark Romance"];
const ADMIN_PASSWORD = "kokoro2025";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #080810; }
  ::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 4px; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }

  .fade-up { animation: fadeUp 0.4s ease both; }

  .admin-input {
    width: 100%; padding: 11px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 300;
    color: #e8e0d0; outline: none;
    transition: border-color 0.2s;
  }
  .admin-input:focus { border-color: rgba(201,168,76,0.5); }
  .admin-input::placeholder { color: rgba(232,224,208,0.2); }

  .admin-select {
    width: 100%; padding: 11px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 300;
    color: #e8e0d0; outline: none;
    cursor: pointer;
    transition: border-color 0.2s;
  }
  .admin-select:focus { border-color: rgba(201,168,76,0.5); }

  .admin-textarea {
    width: 100%; padding: 11px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 300;
    color: #e8e0d0; outline: none; resize: vertical;
    transition: border-color 0.2s;
    min-height: 100px;
  }
  .admin-textarea:focus { border-color: rgba(201,168,76,0.5); }

  .cta-btn { cursor: pointer; border: none; transition: all 0.2s; }
  .cta-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(201,168,76,0.35) !important; }

  .ghost-btn { cursor: pointer; transition: all 0.2s; }
  .ghost-btn:hover { background: rgba(201,168,76,0.08) !important; border-color: rgba(201,168,76,0.3) !important; }

  .danger-btn { cursor: pointer; border: none; transition: all 0.2s; }
  .danger-btn:hover { background: rgba(200,60,60,0.15) !important; border-color: rgba(200,60,60,0.4) !important; color: #e07070 !important; }

  .nav-item { cursor: pointer; transition: all 0.15s; border-radius: 6px; }
  .nav-item:hover { background: rgba(201,168,76,0.06) !important; }

  .series-row { transition: background 0.15s; }
  .series-row:hover { background: rgba(255,255,255,0.03) !important; }

  .upload-zone {
    border: 2px dashed rgba(201,168,76,0.2);
    border-radius: 8px; padding: 32px;
    text-align: center; cursor: pointer;
    transition: all 0.2s;
  }
  .upload-zone:hover {
    border-color: rgba(201,168,76,0.5);
    background: rgba(201,168,76,0.04);
  }

  .tab-btn { cursor: pointer; border: none; transition: all 0.2s; }
  .tab-btn:hover { color: #e8e0d0 !important; }

  .toggle-switch {
    width: 36px; height: 20px;
    border-radius: 10px; cursor: pointer;
    position: relative; transition: background 0.2s;
    border: none; flex-shrink: 0;
  }
  .toggle-knob {
    position: absolute; top: 3px;
    width: 14px; height: 14px;
    border-radius: 50%; background: white;
    transition: left 0.2s;
  }

  .gold-shimmer {
    background: linear-gradient(90deg, #c9a84c, #f0d080, #c9a84c);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }
`;

// ── LOGIN GATE ──
function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!password) { setError("Enter password"); return; }
    setLoading(true);
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        onLogin();
      } else {
        setError("Incorrect password");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ position: "fixed", top: -200, right: -100, width: 500, height: 500, borderRadius: "50%", background: "rgba(100,60,160,0.1)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div className="fade-up" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "48px 40px", width: 380, boxShadow: "0 24px 80px rgba(0,0,0,0.5)", textAlign: "center" }}>
        <div style={{ width: 48, height: 48, background: "linear-gradient(135deg, #c9a84c, #8a6020)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 20px" }}>⬡</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#e8e0d0", marginBottom: 6 }}>Admin Access</h2>
        <p style={{ fontSize: 12, color: "rgba(232,224,208,0.35)", fontWeight: 300, marginBottom: 28 }}>KOKORO Manhwa · Content Management</p>

        <div style={{ marginBottom: 14 }}>
          <input
            className="admin-input"
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ textAlign: "center", letterSpacing: "0.15em" }}
          />
          {error && <p style={{ fontSize: 11, color: "#e07070", marginTop: 6, fontWeight: 300 }}>{error}</p>}
        </div>

        <button className="cta-btn" onClick={handleLogin} style={{
          width: "100%", padding: "13px",
          background: loading ? "rgba(201,168,76,0.5)" : "linear-gradient(135deg, #c9a84c, #8a6020)",
          color: "#080810", borderRadius: 6, fontSize: 13,
          fontFamily: "'DM Sans'", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {loading
            ? <><div style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(8,8,16,0.3)", borderTopColor: "#080810", animation: "spin 0.7s linear infinite" }} /> Checking...</>
            : "Enter Dashboard"}
        </button>

        <p style={{ fontSize: 11, color: "rgba(232,224,208,0.2)", marginTop: 20, fontWeight: 300 }}>
          Default password: <span style={{ color: "rgba(201,168,76,0.5)", fontFamily: "monospace" }}>kokoro2025</span>
        </p>
      </div>
    </div>
  );
}

// ── MAIN ADMIN ──
export default function Admin() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [series, setSeries] = useState(MOCK_SERIES);
  const [activeTab, setActiveTab] = useState("series"); // series | chapter
  const [notification, setNotification] = useState(null);

  // New series form
  const [newSeries, setNewSeries] = useState({ title: "", genre: "", status: "Ongoing", description: "", author: "", artist: "", coverUrl: "" });

  // New chapter form
  const [newChapter, setNewChapter] = useState({ seriesId: "", chapterNum: "", title: "", pages: "" });

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const updateSeries = (field, val) => setNewSeries(s => ({ ...s, [field]: val }));
  const updateChapter = (field, val) => setNewChapter(c => ({ ...c, [field]: val }));

  const handleAddSeries = () => {
    if (!newSeries.title || !newSeries.genre) { showNotif("Title and genre are required", "error"); return; }
    const s = { id: Date.now(), ...newSeries, chapters: 0, views: "0", lastUpdated: "Just now", active: true, cover: `https://picsum.photos/seed/${newSeries.title}/300/420` };
    setSeries(prev => [s, ...prev]);
    setNewSeries({ title: "", genre: "", status: "Ongoing", description: "", author: "", artist: "", coverUrl: "" });
    showNotif(`"${s.title}" added successfully`);
    setActiveNav("series");
  };

  const handleAddChapter = () => {
    if (!newChapter.seriesId || !newChapter.chapterNum) { showNotif("Series and chapter number required", "error"); return; }
    setSeries(prev => prev.map(s => s.id === Number(newChapter.seriesId) ? { ...s, chapters: s.chapters + 1, lastUpdated: "Just now" } : s));
    setNewChapter({ seriesId: "", chapterNum: "", title: "", pages: "" });
    showNotif(`Chapter ${newChapter.chapterNum} uploaded successfully`);
    setActiveNav("series");
  };

  const toggleActive = (id) => setSeries(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  const deleteSeries = (id) => { setSeries(prev => prev.filter(s => s.id !== id)); showNotif("Series deleted", "error"); };

  if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />;

  const navItems = [
    { id: "dashboard", icon: "◈", label: "Dashboard" },
    { id: "series", icon: "📚", label: "Series" },
    { id: "upload", icon: "⊕", label: "Upload" },
    { id: "settings", icon: "⚙", label: "Settings" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#e8e0d0", fontFamily: "'DM Sans', sans-serif", display: "flex" }}>
      <style>{css}</style>

      {/* Notification toast */}
      {notification && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 999,
          background: notification.type === "error" ? "rgba(200,60,60,0.15)" : "rgba(201,168,76,0.15)",
          border: `1px solid ${notification.type === "error" ? "rgba(200,60,60,0.3)" : "rgba(201,168,76,0.3)"}`,
          borderRadius: 8, padding: "12px 18px",
          fontSize: 13, fontWeight: 400,
          color: notification.type === "error" ? "#e07070" : "#c9a84c",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          animation: "fadeUp 0.3s ease",
        }}>
          {notification.type === "error" ? "✕ " : "✓ "}{notification.msg}
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 220, flexShrink: 0,
        background: "rgba(255,255,255,0.02)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        padding: "24px 14px",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px", marginBottom: 32 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #c9a84c, #8a6020)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⬡</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700 }}>KOKORO</div>
            <div style={{ fontSize: 9, color: "#c9a84c", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 300 }}>Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
          {navItems.map(item => (
            <div key={item.id} className="nav-item" onClick={() => setActiveNav(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px",
              background: activeNav === item.id ? "rgba(201,168,76,0.1)" : "transparent",
              borderLeft: activeNav === item.id ? "2px solid #c9a84c" : "2px solid transparent",
            }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: activeNav === item.id ? 500 : 300, color: activeNav === item.id ? "#c9a84c" : "rgba(232,224,208,0.5)", letterSpacing: "0.04em" }}>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14 }}>
          <div className="nav-item" onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px" }}>
            <span style={{ fontSize: 13 }}>←</span>
            <span style={{ fontSize: 12, fontWeight: 300, color: "rgba(232,224,208,0.35)" }}>View Site</span>
          </div>
          <div className="nav-item" onClick={() => setLoggedIn(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px" }}>
            <span style={{ fontSize: 13 }}>⏻</span>
            <span style={{ fontSize: 12, fontWeight: 300, color: "rgba(232,224,208,0.35)" }}>Logout</span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, padding: "32px 36px", overflowY: "auto", maxHeight: "100vh" }}>

        {/* ── DASHBOARD ── */}
        {activeNav === "dashboard" && (
          <div className="fade-up">
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 10, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>✦ Overview</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700 }}>
                Good day, <span className="gold-shimmer">Admin</span>
              </h1>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 36 }}>
              {STATS.map((stat, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "20px" }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{stat.icon}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#c9a84c", marginBottom: 4 }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: "rgba(232,224,208,0.5)", fontWeight: 300, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ fontSize: 11, color: "rgba(100,200,100,0.7)", fontWeight: 300 }}>{stat.change}</div>
                </div>
              ))}
            </div>

            {/* Recent series */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700 }}>Recent Series</h3>
                <button className="ghost-btn" onClick={() => setActiveNav("series")} style={{ fontSize: 11, color: "#c9a84c", background: "transparent", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 4, padding: "5px 12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>View All</button>
              </div>
              {series.slice(0, 4).map((s, i) => (
                <div key={s.id} className="series-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <img src={s.cover} alt="" style={{ width: 36, height: 50, borderRadius: 4, objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontFamily: "'Playfair Display', serif", color: "#e8e0d0", marginBottom: 3 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(232,224,208,0.35)", fontWeight: 300 }}>{s.genre} · {s.chapters} chapters · {s.views} views</div>
                  </div>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, background: s.active ? "rgba(100,180,100,0.1)" : "rgba(200,60,60,0.1)", color: s.active ? "#80c480" : "#e07070", border: `1px solid ${s.active ? "rgba(100,180,100,0.2)" : "rgba(200,60,60,0.2)"}`, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.active ? "Live" : "Hidden"}</span>
                  <span style={{ fontSize: 11, color: "rgba(232,224,208,0.25)", fontWeight: 300, minWidth: 80, textAlign: "right" }}>{s.lastUpdated}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SERIES MANAGER ── */}
        {activeNav === "series" && (
          <div className="fade-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 10, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>✦ Content</div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700 }}>Manage Series</h1>
              </div>
              <button className="cta-btn" onClick={() => setActiveNav("upload")} style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "11px 20px", borderRadius: 6, fontSize: 12, fontFamily: "'DM Sans'", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>+ Add New</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Header row */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 80px 100px 80px", gap: 12, padding: "8px 16px", fontSize: 10, color: "rgba(232,224,208,0.3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                <span>Series</span><span>Genre</span><span>Chapters</span><span>Status</span><span>Views</span><span>Updated</span><span>Actions</span>
              </div>

              {series.map(s => (
                <div key={s.id} className="series-row" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 80px 100px 80px", gap: 12, alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <img src={s.cover} alt="" style={{ width: 32, height: 44, borderRadius: 3, objectFit: "cover", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontFamily: "'Playfair Display', serif", color: "#e8e0d0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "#c9a84c", fontWeight: 300 }}>{s.genre}</span>
                  <span style={{ fontSize: 13, color: "rgba(232,224,208,0.7)", textAlign: "center" }}>{s.chapters}</span>
                  <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 3, background: s.status === "Completed" ? "rgba(100,180,100,0.1)" : "rgba(201,168,76,0.1)", color: s.status === "Completed" ? "#80c480" : "#c9a84c", border: `1px solid ${s.status === "Completed" ? "rgba(100,180,100,0.2)" : "rgba(201,168,76,0.2)"}`, textAlign: "center", letterSpacing: "0.06em", textTransform: "uppercase", justifySelf: "start" }}>{s.status}</span>
                  <span style={{ fontSize: 11, color: "rgba(232,224,208,0.4)", fontWeight: 300 }}>{s.views}</span>
                  <span style={{ fontSize: 11, color: "rgba(232,224,208,0.3)", fontWeight: 300 }}>{s.lastUpdated}</span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <button className="toggle-switch" onClick={() => toggleActive(s.id)} style={{ background: s.active ? "linear-gradient(135deg, #c9a84c, #8a6020)" : "rgba(255,255,255,0.1)" }}>
                      <div className="toggle-knob" style={{ left: s.active ? 19 : 3 }} />
                    </button>
                    <button className="danger-btn" onClick={() => deleteSeries(s.id)} style={{ background: "rgba(200,60,60,0.08)", border: "1px solid rgba(200,60,60,0.15)", borderRadius: 4, padding: "4px 8px", fontSize: 11, color: "rgba(200,60,60,0.5)" }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── UPLOAD ── */}
        {activeNav === "upload" && (
          <div className="fade-up">
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>✦ Content</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700 }}>Upload Content</h1>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 28 }}>
              {[["series", "New Series"], ["chapter", "New Chapter"]].map(([val, label]) => (
                <button key={val} className="tab-btn" onClick={() => setActiveTab(val)} style={{
                  padding: "11px 24px", fontSize: 12,
                  fontFamily: "'DM Sans'", fontWeight: activeTab === val ? 500 : 300,
                  color: activeTab === val ? "#c9a84c" : "rgba(232,224,208,0.35)",
                  background: "none", letterSpacing: "0.1em", textTransform: "uppercase",
                  borderBottom: activeTab === val ? "2px solid #c9a84c" : "2px solid transparent",
                  marginBottom: -1,
                }}>{label}</button>
              ))}
            </div>

            {activeTab === "series" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 800 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(232,224,208,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Series Title *</label>
                    <input className="admin-input" placeholder="The Remarried Empress" value={newSeries.title} onChange={e => updateSeries("title", e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(232,224,208,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Genre *</label>
                    <select className="admin-select" value={newSeries.genre} onChange={e => updateSeries("genre", e.target.value)}>
                      <option value="" style={{ background: "#12121e" }}>Select genre</option>
                      {GENRES.map(g => <option key={g} value={g} style={{ background: "#12121e" }}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(232,224,208,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Status</label>
                    <select className="admin-select" value={newSeries.status} onChange={e => updateSeries("status", e.target.value)}>
                      <option value="Ongoing" style={{ background: "#12121e" }}>Ongoing</option>
                      <option value="Completed" style={{ background: "#12121e" }}>Completed</option>
                      <option value="Hiatus" style={{ background: "#12121e" }}>Hiatus</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(232,224,208,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Author</label>
                    <input className="admin-input" placeholder="Author name" value={newSeries.author} onChange={e => updateSeries("author", e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(232,224,208,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Artist</label>
                    <input className="admin-input" placeholder="Artist name" value={newSeries.artist} onChange={e => updateSeries("artist", e.target.value)} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(232,224,208,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Description</label>
                    <textarea className="admin-textarea" placeholder="Write a compelling description..." value={newSeries.description} onChange={e => updateSeries("description", e.target.value)} style={{ minHeight: 120 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(232,224,208,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Cover Image URL</label>
                    <input className="admin-input" placeholder="https://..." value={newSeries.coverUrl} onChange={e => updateSeries("coverUrl", e.target.value)} />
                  </div>
                  <div className="upload-zone">
                    <div style={{ fontSize: 28, marginBottom: 10 }}>⊕</div>
                    <p style={{ fontSize: 13, color: "rgba(232,224,208,0.5)", fontWeight: 300, marginBottom: 4 }}>Upload cover image</p>
                    <p style={{ fontSize: 11, color: "rgba(232,224,208,0.25)", fontWeight: 300 }}>PNG, JPG up to 5MB</p>
                  </div>
                </div>

                <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <button className="ghost-btn" onClick={() => setNewSeries({ title: "", genre: "", status: "Ongoing", description: "", author: "", artist: "", coverUrl: "" })} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(232,224,208,0.4)", padding: "11px 22px", borderRadius: 6, fontSize: 12, fontFamily: "'DM Sans'", letterSpacing: "0.08em", textTransform: "uppercase" }}>Clear</button>
                  <button className="cta-btn" onClick={handleAddSeries} style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "11px 28px", borderRadius: 6, fontSize: 12, fontFamily: "'DM Sans'", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: "0 6px 20px rgba(201,168,76,0.25)" }}>Publish Series ✦</button>
                </div>
              </div>
            )}

            {activeTab === "chapter" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 800 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(232,224,208,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Select Series *</label>
                    <select className="admin-select" value={newChapter.seriesId} onChange={e => updateChapter("seriesId", e.target.value)}>
                      <option value="" style={{ background: "#12121e" }}>Choose series</option>
                      {series.map(s => <option key={s.id} value={s.id} style={{ background: "#12121e" }}>{s.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(232,224,208,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Chapter Number *</label>
                    <input className="admin-input" type="number" placeholder="e.g. 157" value={newChapter.chapterNum} onChange={e => updateChapter("chapterNum", e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(232,224,208,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Chapter Title</label>
                    <input className="admin-input" placeholder="e.g. The Final Decision" value={newChapter.title} onChange={e => updateChapter("title", e.target.value)} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(232,224,208,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Page Image URLs</label>
                    <textarea className="admin-textarea" placeholder={"One URL per line:\nhttps://image1.jpg\nhttps://image2.jpg\n..."} value={newChapter.pages} onChange={e => updateChapter("pages", e.target.value)} style={{ minHeight: 140 }} />
                    <p style={{ fontSize: 11, color: "rgba(232,224,208,0.25)", marginTop: 6, fontWeight: 300 }}>Paste image URLs one per line</p>
                  </div>
                  <div className="upload-zone">
                    <div style={{ fontSize: 28, marginBottom: 10 }}>⊕</div>
                    <p style={{ fontSize: 13, color: "rgba(232,224,208,0.5)", fontWeight: 300, marginBottom: 4 }}>Upload chapter pages</p>
                    <p style={{ fontSize: 11, color: "rgba(232,224,208,0.25)", fontWeight: 300 }}>Multiple images supported</p>
                  </div>
                </div>

                <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <button className="ghost-btn" onClick={() => setNewChapter({ seriesId: "", chapterNum: "", title: "", pages: "" })} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(232,224,208,0.4)", padding: "11px 22px", borderRadius: 6, fontSize: 12, fontFamily: "'DM Sans'", letterSpacing: "0.08em", textTransform: "uppercase" }}>Clear</button>
                  <button className="cta-btn" onClick={handleAddChapter} style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "11px 28px", borderRadius: 6, fontSize: 12, fontFamily: "'DM Sans'", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: "0 6px 20px rgba(201,168,76,0.25)" }}>Publish Chapter ✦</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeNav === "settings" && (
          <div className="fade-up">
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>✦ Configuration</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700 }}>Site Settings</h1>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 520 }}>
              {[["Site Name", "KOKORO Manhwa"], ["Tagline", "Монгол хэлээр хамгийн сайхан роман манхва"], ["Contact Email", "admin@kokoro.mn"], ["Admin Password", "••••••••••"]].map(([label, val]) => (
                <div key={label}>
                  <label style={{ fontSize: 11, color: "rgba(232,224,208,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>{label}</label>
                  <input className="admin-input" defaultValue={val} type={label === "Admin Password" ? "password" : "text"} />
                </div>
              ))}
              <button className="cta-btn" style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "12px 24px", borderRadius: 6, fontSize: 12, fontFamily: "'DM Sans'", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", alignSelf: "flex-start", marginTop: 8, boxShadow: "0 6px 20px rgba(201,168,76,0.25)" }}>Save Settings ✦</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}