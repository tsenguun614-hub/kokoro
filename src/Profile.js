import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useWindowSize from "./useWindowSize";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { FONT_IMPORT, baseCss } from "./sharedStyles";
import useAuth from "./lib/useAuth";
import { getProfile, updateProfile, signOut } from "./lib/auth";
import { getBookmarks, removeBookmark as removeBookmarkApi } from "./lib/bookmarks";
import { getReadingHistory, clearReadingHistory } from "./lib/history";
import { timeAgo } from "./lib/format";

const css = `
  ${FONT_IMPORT}
  ${baseCss}

  .tab-btn { cursor: pointer; border: none; transition: all 0.2s; }
  .tab-btn:hover { color: #f7f3ea !important; }

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

  .remove-btn { cursor: pointer; border: none; transition: all 0.2s; opacity: 0; }
  .manga-card:hover .remove-btn { opacity: 1; }
  .remove-btn:hover { background: rgba(200,60,60,0.2) !important; color: #e07070 !important; }

  .edit-input {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px; padding: 10px 14px;
    font-family: 'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif;
    font-size: 13px; font-weight: 300;
    color: #f7f3ea; outline: none; width: 100%;
    transition: border-color 0.2s;
  }
  .edit-input:focus { border-color: rgba(201,168,76,0.5); }
`;

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("bookmarks");
  const [profile, setProfile] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [prefs, setPrefs] = useState({ notif: true, progress: true, autobook: false });
  const width = useWindowSize();
  const isMobile = width < 768;

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    setDataLoading(true);
    Promise.all([getProfile(user.id), getBookmarks(user.id), getReadingHistory(user.id)])
      .then(([p, b, h]) => {
        setProfile(p);
        setUserName(p.username || "");
        setBookmarks(b);
        setHistory(h);
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [user, authLoading, navigate]);

  // Last-read chapter per series, derived from history, to show bookmark progress.
  const lastReadBySeries = {};
  history.forEach((h) => { lastReadBySeries[h.series.id] = h; });

  const removeBookmark = (seriesId, e) => {
    e.stopPropagation();
    setBookmarks(prev => prev.filter(b => b.id !== seriesId));
    removeBookmarkApi(user.id, seriesId).catch(() => {});
  };

  const handleClearHistory = () => {
    setHistory([]);
    clearReadingHistory(user.id).catch(() => {});
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateProfile(user.id, { username: userName });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const tabs = [
    { id: "bookmarks", label: "Хадгалсан", count: bookmarks.length },
    { id: "history", label: "Түүх", count: history.length },
    { id: "settings", label: "Тохиргоо", count: null },
  ];

  if (authLoading || dataLoading || !profile) {
    return (
      <div style={{ minHeight: "100vh", background: "#080810", color: "#f7f3ea", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif" }}>
        <style>{css}</style>
        <Header />
        <div style={{ textAlign: "center", padding: "120px 0" }}>
          <p style={{ fontSize: 14, color: "rgba(247,243,234,0.35)", fontWeight: 400 }}>Ачааллаж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#f7f3ea", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif" }}>
      <style>{css}</style>
      <Header />

      {/* Ambient orbs */}
      <div style={{ position: "fixed", top: -200, right: -100, width: 500, height: 500, borderRadius: "50%", background: "rgba(100,60,160,0.08)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: 0, left: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(201,168,76,0.05)", filter: "blur(80px)", pointerEvents: "none" }} />

      {/* ── PROFILE BANNER ── */}
      <div style={{ position: "relative", background: "linear-gradient(135deg, rgba(100,60,160,0.15) 0%, rgba(201,168,76,0.08) 50%, rgba(160,60,80,0.1) 100%)", borderBottom: "1px solid rgba(201,168,76,0.1)", padding: isMobile ? "32px 4% 0" : "48px 5% 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="fade-up" style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "flex-end", gap: isMobile ? 16 : 28, paddingBottom: 28 }}>

            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <div style={{
                width: isMobile ? 64 : 80, height: isMobile ? 64 : 80, borderRadius: "50%",
                background: "linear-gradient(135deg, #c9a84c, #8a6020)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: isMobile ? 26 : 32, fontWeight: 700, color: "#080810",
                border: "3px solid rgba(201,168,76,0.4)",
                boxShadow: "0 0 28px rgba(201,168,76,0.2)",
              }}>{(profile.username || "?")[0].toUpperCase()}</div>
              <div style={{ position: "absolute", bottom: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "#6dbb6d", border: "2px solid #080810" }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, paddingBottom: isMobile ? 0 : 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
                <h1 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: isMobile ? 21 : 26, fontWeight: 700, color: "#f7f3ea" }}>{profile.username}</h1>
              </div>
              <p style={{ fontSize: 13, color: "rgba(247,243,234,0.35)", fontWeight: 400, marginBottom: 0 }}>{user.email} · Joined {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: isMobile ? 20 : 32, paddingBottom: isMobile ? 0 : 4 }}>
              {[
                { label: "Уншсан цуврал", value: history.length },
                { label: "Хадгалсан", value: bookmarks.length },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: isMobile ? 19 : 23, fontWeight: 700, color: "#c9a84c" }}>{stat.value}</div>
                  <div style={{ fontSize: isMobile ? 11 : 12, color: "rgba(247,243,234,0.35)", fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
            {tabs.map(tab => (
              <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)} style={{
                padding: isMobile ? "12px 14px" : "12px 22px", fontSize: 13,
                fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: activeTab === tab.id ? 500 : 300,
                color: activeTab === tab.id ? "#c9a84c" : "rgba(247,243,234,0.4)",
                background: "none", letterSpacing: "0.1em", textTransform: "uppercase",
                borderBottom: activeTab === tab.id ? "2px solid #c9a84c" : "2px solid transparent",
                marginBottom: -1, display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap",
              }}>
                {tab.label}
                {tab.count !== null && (
                  <span style={{ fontSize: 12, padding: "1px 7px", borderRadius: 10, background: activeTab === tab.id ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.06)", color: activeTab === tab.id ? "#c9a84c" : "rgba(247,243,234,0.3)" }}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "24px 4% 60px" : "36px 5% 80px" }}>

        {/* ── BOOKMARKS ── */}
        {activeTab === "bookmarks" && (
          <div className="fade-up">
            {bookmarks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
                <h3 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 21, color: "rgba(247,243,234,0.4)", marginBottom: 10 }}>Хадгалсан зүйл байхгүй</h3>
                <p style={{ fontSize: 14, color: "rgba(247,243,234,0.25)", fontWeight: 400, marginBottom: 24 }}>Уншиж эхэлж дуртайгаа хадгал</p>
                <button className="cta-btn" onClick={() => navigate("/browse")} style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "11px 24px", borderRadius: 6, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>Цувралуудыг үзэх</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 12 : 20 }}>
                {bookmarks.map((b, i) => {
                  const lastRead = lastReadBySeries[b.id];
                  const pct = lastRead && b.chapterCount ? Math.round((lastRead.chapter.chapter_number / b.chapterCount) * 100) : 0;
                  return (
                  <div key={b.id} className="manga-card fade-up" style={{ animationDelay: `${i * 0.05}s`, background: "rgba(255,255,255,0.03)", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", position: "relative" }}
                    onClick={() => navigate(`/series/${b.id}`)}>

                    {/* Cover */}
                    <div style={{ position: "relative", paddingBottom: "145%", overflow: "hidden" }}>
                      <img className="card-img" src={b.cover_url} alt={b.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,16,0.92) 0%, rgba(8,8,16,0.2) 55%, transparent 75%)" }} />

                      {/* Remove button */}
                      <button className="remove-btn" onClick={(e) => removeBookmark(b.id, e)} style={{
                        position: "absolute", top: 8, right: 8,
                        background: "rgba(8,8,16,0.7)", backdropFilter: "blur(8px)",
                        color: "rgba(247,243,234,0.5)", borderRadius: 4,
                        padding: "4px 7px", fontSize: 13,
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}>✕</button>

                      {/* Progress bar */}
                      {lastRead && (
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
                          <div style={{ height: 3, background: "rgba(255,255,255,0.1)" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #c9a84c, #f0d080)" }} />
                          </div>
                        </div>
                      )}

                      {/* Continue button */}
                      <div className="continue-btn" style={{ position: "absolute", bottom: 12, left: 0, right: 0, padding: "0 10px", opacity: 0, transition: "opacity 0.25s" }}>
                        <div style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "8px", borderRadius: 3, fontSize: 12, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center" }}>
                          Continue →
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: "12px 12px 14px" }}>
                      <h3 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 14, fontWeight: 700, color: "#f7f3ea", marginBottom: 5, lineHeight: 1.3 }}>{b.title}</h3>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "#c9a84c", fontWeight: 400 }}>{lastRead ? `Ch. ${lastRead.chapter.chapter_number}` : "Эхлээгүй"}</span>
                        {lastRead && <span style={{ fontSize: 12, color: "rgba(247,243,234,0.25)", fontWeight: 400 }}>{pct}%</span>}
                      </div>
                      {lastRead && <div style={{ fontSize: 12, color: "rgba(247,243,234,0.25)", fontWeight: 400 }}>{timeAgo(lastRead.last_read_at)}</div>}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY ── */}
        {activeTab === "history" && (
          <div className="fade-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: "rgba(247,243,234,0.3)", fontWeight: 400 }}>{history.length} саяхан уншсан бүлэг</p>
              {history.length > 0 && (
                <button onClick={handleClearHistory} className="ghost-btn" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(247,243,234,0.35)", padding: "6px 14px", borderRadius: 6, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>Түүхийг цэвэрлэх</button>
              )}
            </div>
            {history.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
                <h3 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 21, color: "rgba(247,243,234,0.4)", marginBottom: 10 }}>Уншсан түүх байхгүй</h3>
                <p style={{ fontSize: 14, color: "rgba(247,243,234,0.25)", fontWeight: 400 }}>Бүлэг уншихад энд харагдана</p>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {history.map((h, i) => (
                <div key={h.id} className="history-row fade-up" style={{ animationDelay: `${i * 0.04}s`, display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}
                  onClick={() => navigate(`/read/${h.series.id}/${h.chapter.chapter_number}`)}>

                  <img src={h.series.cover_url} alt="" style={{ width: 40, height: 56, borderRadius: 4, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(201,168,76,0.1)" }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 15, color: "#f7f3ea", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.series.title}</div>
                    <div style={{ fontSize: 13, color: "#c9a84c", fontWeight: 400 }}>Ch. {h.chapter.chapter_number} — {h.chapter.title}</div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                    <span style={{ fontSize: 13, color: "rgba(247,243,234,0.25)", fontWeight: 400 }}>{timeAgo(h.last_read_at)}</span>
                    <button className="cta-btn" onClick={e => { e.stopPropagation(); navigate(`/read/${h.series.id}/${h.chapter.chapter_number}`); }} style={{
                      background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)",
                      color: "#c9a84c", padding: "6px 14px", borderRadius: 4,
                      fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 400,
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
                <h3 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>Профайл</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(247,243,234,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Нэр</label>
                    <input className="edit-input" value={userName} onChange={e => setUserName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(247,243,234,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Email</label>
                    <input className="edit-input" defaultValue={user.email} disabled style={{ opacity: 0.5, cursor: "not-allowed" }} />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "24px" }}>
                <h3 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>Тохиргоо</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    ["Шинэ бүлгийн и-мэйл мэдэгдэл", "notif"],
                    ["Картан дээр уншилтын явцыг харуулах", "progress"],
                    ["Уншиж эхлэхэд автоматаар хадгалах", "autobook"],
                  ].map(([label, key]) => (
                    <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 14, color: "rgba(247,243,234,0.6)", fontWeight: 400 }}>{label}</span>
                      <div onClick={() => setPrefs(p => ({ ...p, [key]: !p[key] }))} style={{ width: 38, height: 22, borderRadius: 11, background: prefs[key] ? "linear-gradient(135deg, #c9a84c, #8a6020)" : "rgba(255,255,255,0.1)", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
                        <div style={{ position: "absolute", top: 3, left: prefs[key] ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save + Danger zone */}
              <div style={{ display: "flex", gap: 10 }}>
                <button className="cta-btn" onClick={handleSaveProfile} disabled={savingProfile} style={{ flex: 1, background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "12px", borderRadius: 6, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: "0 6px 20px rgba(201,168,76,0.25)", opacity: savingProfile ? 0.6 : 1 }}>{savingProfile ? "Хадгалж байна..." : "Хадгалах ✦"}</button>
                <button onClick={handleLogout} style={{ background: "linear-gradient(135deg, #e04848, #a82020)", border: "none", color: "#fff", padding: "12px 18px", borderRadius: 6, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 6px 20px rgba(224,72,72,0.3)" }}>Гарах</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}