import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const USER = {
  name: "Narantsetseg",
  username: "@narantsetseg",
  avatar: "N",
  joined: "March 2025",
  totalRead: 847,
  chaptersRead: 1240,
  bookmarks: 12,
  level: "Gold Reader",
};

const BOOKMARKS = [
  { id: 1, title: "The Remarried Empress", cover: "https://picsum.photos/seed/empress/300/420", genre: "Royal Romance", progress: 156, total: 156, lastRead: "Ch. 156", lastReadTime: "2 hours ago", status: "Ongoing", rating: 9.8 },
  { id: 2, title: "My Husband Hides His Beauty", cover: "https://picsum.photos/seed/husband/300/420", genre: "Fantasy Romance", progress: 67, total: 89, lastRead: "Ch. 67", lastReadTime: "1 day ago", status: "Ongoing", rating: 9.5 },
  { id: 3, title: "A Business Proposal", cover: "https://picsum.photos/seed/business/300/420", genre: "Modern Romance", progress: 128, total: 128, lastRead: "Ch. 128", lastReadTime: "3 days ago", status: "Completed", rating: 9.6 },
  { id: 4, title: "The Villainess Reverses", cover: "https://picsum.photos/seed/villainess/300/420", genre: "Isekai Romance", progress: 44, total: 112, lastRead: "Ch. 44", lastReadTime: "1 week ago", status: "Ongoing", rating: 9.4 },
  { id: 5, title: "I Became the Tyrant's Secretary", cover: "https://picsum.photos/seed/tyrant/300/420", genre: "Historical Romance", progress: 30, total: 67, lastRead: "Ch. 30", lastReadTime: "2 weeks ago", status: "Ongoing", rating: 9.2 },
  { id: 6, title: "Beware of the Villainess", cover: "https://picsum.photos/seed/beware/300/420", genre: "Dark Romance", progress: 95, total: 95, lastRead: "Ch. 95", lastReadTime: "1 month ago", status: "Completed", rating: 9.3 },
];

const HISTORY = [
  { id: 1, title: "The Remarried Empress", cover: "https://picsum.photos/seed/empress/300/420", chapter: "Ch. 156 — When Empires Fall", time: "2 hours ago" },
  { id: 2, title: "My Husband Hides His Beauty", cover: "https://picsum.photos/seed/husband/300/420", chapter: "Ch. 67 — The Hidden Face", time: "1 day ago" },
  { id: 3, title: "A Business Proposal", cover: "https://picsum.photos/seed/business/300/420", chapter: "Ch. 128 — Final Chapter", time: "3 days ago" },
  { id: 4, title: "The Villainess Reverses", cover: "https://picsum.photos/seed/villainess/300/420", chapter: "Ch. 44 — A Dangerous Game", time: "1 week ago" },
  { id: 5, title: "I Became the Tyrant's Secretary", cover: "https://picsum.photos/seed/tyrant/300/420", chapter: "Ch. 30 — Midnight Orders", time: "2 weeks ago" },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #080810; }
  ::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 4px; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }

  .fade-up { animation: fadeUp 0.45s ease both; }
  .fade-up-1 { animation-delay: 0.08s; }
  .fade-up-2 { animation-delay: 0.16s; }
  .fade-up-3 { animation-delay: 0.24s; }

  .gold-shimmer {
    background: linear-gradient(90deg, #c9a84c, #f0d080, #c9a84c);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }

  .nav-link { cursor: pointer; transition: color 0.2s; }
  .nav-link:hover { color: #c9a84c !important; }

  .tab-btn { cursor: pointer; border: none; transition: all 0.2s; }
  .tab-btn:hover { color: #e8e0d0 !important; }

  .manga-card {
    cursor: pointer;
    transition: transform 0.35s cubic-bezier(.22,.68,0,1.2), box-shadow 0.35s ease;
  }
  .manga-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.25) !important;
  }
  .manga-card:hover .card-img { transform: scale(1.05); }
  .manga-card:hover .continue-btn { opacity: 1 !important; }
  .card-img { transition: transform 0.4s ease; }

  .history-row {
    cursor: pointer;
    transition: background 0.15s, border-left-color 0.15s;
    border-left: 2px solid transparent;
  }
  .history-row:hover {
    background: rgba(201,168,76,0.05) !important;
    border-left-color: rgba(201,168,76,0.35) !important;
  }

  .cta-btn { cursor: pointer; border: none; transition: all 0.2s; }
  .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(201,168,76,0.35) !important; }

  .ghost-btn { cursor: pointer; transition: all 0.2s; }
  .ghost-btn:hover { background: rgba(201,168,76,0.08) !important; border-color: rgba(201,168,76,0.4) !important; color: #c9a84c !important; }

  .remove-btn { cursor: pointer; border: none; transition: all 0.2s; opacity: 0; }
  .manga-card:hover .remove-btn { opacity: 1; }
  .remove-btn:hover { background: rgba(200,60,60,0.2) !important; color: #e07070 !important; }

  .edit-input {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px; padding: 10px 14px;
    font-family: 'Montserrat', sans-serif;
    font-size: 13px; font-weight: 300;
    color: #e8e0d0; outline: none; width: 100%;
    transition: border-color 0.2s;
  }
  .edit-input:focus { border-color: rgba(201,168,76,0.5); }
`;

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("bookmarks");
  const [bookmarks, setBookmarks] = useState(BOOKMARKS);
  const [editMode, setEditMode] = useState(false);
  const [userName, setUserName] = useState(USER.name);
  const [prefs, setPrefs] = useState({ notif: true, progress: true, autobook: false });

  const removeBookmark = (id, e) => {
    e.stopPropagation();
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const tabs = [
    { id: "bookmarks", label: "Хадгалсан", count: bookmarks.length },
    { id: "history", label: "Түүх", count: HISTORY.length },
    { id: "settings", label: "Тохиргоо", count: null },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#e8e0d0", fontFamily: "'Montserrat', sans-serif" }}>
      <style>{css}</style>
      {/* ── HEADER ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(8,8,16,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(201,168,76,0.12)", padding: "0 5%" }}>
  <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => navigate("/")}>
      <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #c9a84c, #8a6020)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, animation: "pulse-glow 3s ease infinite" }}>⬡</div>
      <div>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#e8e0d0", letterSpacing: "0.01em" }}>KOKORO</span>
        <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 9, fontWeight: 300, letterSpacing: "0.25em", color: "#c9a84c", textTransform: "uppercase", marginLeft: 8 }}>MANHWA</span>
      </div>
    </div>
    <nav style={{ display: "flex", gap: 32, alignItems: "center" }}>
      {[
  { label: "Нүүр", path: "/" },
  { label: "Бүх гаргалт", path: "/browse" },
  { label: "Bookmarks", path: "/profile" },
].map(item => {
  const active = location.pathname === item.path;
  return (
    <span key={item.label} className="nav-link" onClick={() => navigate(item.path)} style={{
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 13,
      fontWeight: active ? 500 : 300,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: active ? "#c9a84c" : "rgba(232,224,208,0.55)",
      textShadow: active ? "0 0 14px rgba(201,168,76,0.7)" : "none",
      position: "relative",
    }}>
      {item.label}
      {active && <span style={{ position: "absolute", bottom: -4, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #c9a84c, transparent)", borderRadius: 1 }} />}
    </span>
  );
})}
    </nav>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 6, padding: "7px 16px", gap: 10 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input placeholder="Хайх..." onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) navigate("/browse"); }} style={{ background: "none", border: "none", outline: "none", fontFamily: "'Montserrat', sans-serif", fontSize: 13, color: "#e8e0d0", width: 160, fontWeight: 300 }} />
      </div>
      <button onClick={() => navigate("/auth")} style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 12, color: "#080810", fontFamily: "'Montserrat', sans-serif", fontWeight: 500, letterSpacing: "0.08em", cursor: "pointer", textTransform: "uppercase" }}>НЭВТРЭХ</button>
    </div>
  </div>
</header>
      {/* Ambient orbs */}
      <div style={{ position: "fixed", top: -200, right: -100, width: 500, height: 500, borderRadius: "50%", background: "rgba(100,60,160,0.08)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: 0, left: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(201,168,76,0.05)", filter: "blur(80px)", pointerEvents: "none" }} />

      {/* ── PROFILE BANNER ── */}
      <div style={{ position: "relative", background: "linear-gradient(135deg, rgba(100,60,160,0.15) 0%, rgba(201,168,76,0.08) 50%, rgba(160,60,80,0.1) 100%)", borderBottom: "1px solid rgba(201,168,76,0.1)", padding: "48px 5% 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="fade-up" style={{ display: "flex", alignItems: "flex-end", gap: 28, paddingBottom: 28 }}>

            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "linear-gradient(135deg, #c9a84c, #8a6020)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, fontWeight: 700, color: "#080810",
                border: "3px solid rgba(201,168,76,0.4)",
                boxShadow: "0 0 28px rgba(201,168,76,0.2)",
              }}>{USER.avatar}</div>
              <div style={{ position: "absolute", bottom: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "#6dbb6d", border: "2px solid #080810" }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, paddingBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#e8e0d0" }}>{userName}</h1>
                <span style={{ fontSize: 9, padding: "3px 10px", borderRadius: 12, background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.1))", border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>✦ {USER.level}</span>
              </div>
              <p style={{ fontSize: 12, color: "rgba(232,224,208,0.35)", fontWeight: 300, marginBottom: 0 }}>{USER.username} · Joined {USER.joined}</p>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 32, paddingBottom: 4 }}>
              {[
                { label: "Уншсан цуврал", value: USER.totalRead },
                { label: "Бүлгүүд", value: USER.chaptersRead.toLocaleString() },
                { label: "Хадгалсан", value: bookmarks.length },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#c9a84c" }}>{stat.value}</div>
                  <div style={{ fontSize: 10, color: "rgba(232,224,208,0.35)", fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0 }}>
            {tabs.map(tab => (
              <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)} style={{
                padding: "12px 22px", fontSize: 12,
                fontFamily: "'Montserrat'", fontWeight: activeTab === tab.id ? 500 : 300,
                color: activeTab === tab.id ? "#c9a84c" : "rgba(232,224,208,0.4)",
                background: "none", letterSpacing: "0.1em", textTransform: "uppercase",
                borderBottom: activeTab === tab.id ? "2px solid #c9a84c" : "2px solid transparent",
                marginBottom: -1, display: "flex", alignItems: "center", gap: 7,
              }}>
                {tab.label}
                {tab.count !== null && (
                  <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 10, background: activeTab === tab.id ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.06)", color: activeTab === tab.id ? "#c9a84c" : "rgba(232,224,208,0.3)" }}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 5% 80px" }}>

        {/* ── BOOKMARKS ── */}
        {activeTab === "bookmarks" && (
          <div className="fade-up">
            {bookmarks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "rgba(232,224,208,0.4)", marginBottom: 10 }}>Хадгалсан зүйл байхгүй</h3>
                <p style={{ fontSize: 13, color: "rgba(232,224,208,0.25)", fontWeight: 300, marginBottom: 24 }}>Уншиж эхэлж дуртайгаа хадгал</p>
                <button className="cta-btn" onClick={() => navigate("/browse")} style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "11px 24px", borderRadius: 6, fontSize: 12, fontFamily: "'Montserrat'", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>Цувралуудыг үзэх</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
                {bookmarks.map((b, i) => (
                  <div key={b.id} className="manga-card fade-up" style={{ animationDelay: `${i * 0.05}s`, background: "rgba(255,255,255,0.03)", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", position: "relative" }}
                    onClick={() => navigate(`/series/${b.id}`)}>

                    {/* Cover */}
                    <div style={{ position: "relative", paddingBottom: "145%", overflow: "hidden" }}>
                      <img className="card-img" src={b.cover} alt={b.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,16,0.92) 0%, rgba(8,8,16,0.2) 55%, transparent 75%)" }} />

                      {/* Remove button */}
                      <button className="remove-btn" onClick={(e) => removeBookmark(b.id, e)} style={{
                        position: "absolute", top: 8, right: 8,
                        background: "rgba(8,8,16,0.7)", backdropFilter: "blur(8px)",
                        color: "rgba(232,224,208,0.5)", borderRadius: 4,
                        padding: "4px 7px", fontSize: 11,
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}>✕</button>

                      {/* Progress bar */}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
                        <div style={{ height: 3, background: "rgba(255,255,255,0.1)" }}>
                          <div style={{ height: "100%", width: `${Math.round((b.progress / b.total) * 100)}%`, background: "linear-gradient(90deg, #c9a84c, #f0d080)" }} />
                        </div>
                      </div>

                      {/* Continue button */}
                      <div className="continue-btn" style={{ position: "absolute", bottom: 12, left: 0, right: 0, padding: "0 10px", opacity: 0, transition: "opacity 0.25s" }}>
                        <div style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "8px", borderRadius: 3, fontSize: 10, fontFamily: "'Montserrat'", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center" }}>
                          Continue →
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: "12px 12px 14px" }}>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 500, color: "#e8e0d0", marginBottom: 5, lineHeight: 1.3 }}>{b.title}</h3>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 10, color: "#c9a84c", fontWeight: 300 }}>{b.lastRead}</span>
                        <span style={{ fontSize: 10, color: "rgba(232,224,208,0.25)", fontWeight: 300 }}>{Math.round((b.progress / b.total) * 100)}%</span>
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(232,224,208,0.25)", fontWeight: 300 }}>{b.lastReadTime}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY ── */}
        {activeTab === "history" && (
          <div className="fade-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: "rgba(232,224,208,0.3)", fontWeight: 300 }}>{HISTORY.length} саяхан уншсан бүлэг</p>
              <button className="ghost-btn" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(232,224,208,0.35)", padding: "6px 14px", borderRadius: 6, fontSize: 11, fontFamily: "'Montserrat'", letterSpacing: "0.08em", textTransform: "uppercase" }}>Түүхийг цэвэрлэх</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {HISTORY.map((h, i) => (
                <div key={i} className="history-row fade-up" style={{ animationDelay: `${i * 0.04}s`, display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}
                  onClick={() => navigate(`/read/${h.title.toLowerCase().replace(/\s/g, "-")}/1`)}>

                  <img src={h.cover} alt="" style={{ width: 40, height: 56, borderRadius: 4, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(201,168,76,0.1)" }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#e8e0d0", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.title}</div>
                    <div style={{ fontSize: 12, color: "#c9a84c", fontWeight: 300 }}>{h.chapter}</div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: "rgba(232,224,208,0.25)", fontWeight: 300 }}>{h.time}</span>
                    <button className="cta-btn" onClick={e => { e.stopPropagation(); navigate(`/read/series/1`); }} style={{
                      background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)",
                      color: "#c9a84c", padding: "6px 14px", borderRadius: 4,
                      fontSize: 11, fontFamily: "'Montserrat'", fontWeight: 400,
                      letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>Үргэлжлүүлэх</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeTab === "settings" && (
          <div className="fade-up" style={{ maxWidth: 520 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Profile section */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "24px" }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>Профайл</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[["Нэр", userName, setUserName], ["Username", USER.username, () => {}], ["Email", "narantsetseg@gmail.com", () => {}]].map(([label, val, setter]) => (
                    <div key={label}>
                      <label style={{ fontSize: 11, color: "rgba(232,224,208,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>{label}</label>
                      <input className="edit-input" defaultValue={val} onChange={e => setter(e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferences */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "24px" }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>Тохиргоо</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    ["Шинэ бүлгийн и-мэйл мэдэгдэл", "notif"],
                    ["Картан дээр уншилтын явцыг харуулах", "progress"],
                    ["Уншиж эхлэхэд автоматаар хадгалах", "autobook"],
                  ].map(([label, key]) => (
                    <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "rgba(232,224,208,0.6)", fontWeight: 300 }}>{label}</span>
                      <div onClick={() => setPrefs(p => ({ ...p, [key]: !p[key] }))} style={{ width: 38, height: 22, borderRadius: 11, background: prefs[key] ? "linear-gradient(135deg, #c9a84c, #8a6020)" : "rgba(255,255,255,0.1)", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
                        <div style={{ position: "absolute", top: 3, left: prefs[key] ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save + Danger zone */}
              <div style={{ display: "flex", gap: 10 }}>
                <button className="cta-btn" style={{ flex: 1, background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "12px", borderRadius: 6, fontSize: 12, fontFamily: "'Montserrat'", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: "0 6px 20px rgba(201,168,76,0.25)" }}>Хадгалах ✦</button>
                <button className="ghost-btn" style={{ background: "rgba(200,60,60,0.08)", border: "1px solid rgba(200,60,60,0.15)", color: "rgba(200,60,60,0.6)", padding: "12px 18px", borderRadius: 6, fontSize: 12, fontFamily: "'Montserrat'", letterSpacing: "0.08em", textTransform: "uppercase" }}>Гарах</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}