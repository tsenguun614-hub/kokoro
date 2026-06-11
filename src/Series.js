import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SERIES = {
  id: 1,
  title: "The Remarried Empress",
  cover: "https://picsum.photos/seed/empress/400/560",
  banner: "https://picsum.photos/seed/empressbanner/1200/400",
  genre: ["Royal Romance", "Drama", "Fantasy"],
  status: "Ongoing",
  rating: 9.8,
  views: "2.4M",
  bookmarks: "184K",
  author: "Alphatart",
  artist: "Chirun",
  released: "2019",
  description: `Navier Ellie Trovi was an empress perfect in every way — dutiful, elegant, and respected by all. She had dedicated her entire life to the empire and to her husband, Emperor Sovieshu.

But when Sovieshu brings in a slave girl named Rashta and begins neglecting his duties and his empress, Navier finds herself at a crossroads. Betrayed by the man she devoted herself to, she must decide — crumble, or rise.

When the emperor demands a divorce, Navier doesn't beg or cry. Instead, she makes a single, devastating request that shocks the entire empire.

A story of a woman who refuses to be discarded. Of power, pride, and a love that comes when you least expect it.`,
  chapters: [
    { id: 156, title: "When Empires Fall", date: "2 hours ago", isNew: true },
    { id: 155, title: "A Shattered Vow", date: "7 days ago", isNew: false },
    { id: 154, title: "The Weight of a Crown", date: "14 days ago", isNew: false },
    { id: 153, title: "Shadows in the Court", date: "21 days ago", isNew: false },
    { id: 152, title: "The Emperor's Mistake", date: "28 days ago", isNew: false },
    { id: 151, title: "A Queen's Silence", date: "35 days ago", isNew: false },
    { id: 150, title: "When the Rose Blooms", date: "42 days ago", isNew: false },
    { id: 149, title: "The Northern King", date: "49 days ago", isNew: false },
    { id: 148, title: "Letters Never Sent", date: "56 days ago", isNew: false },
    { id: 147, title: "Coronation", date: "63 days ago", isNew: false },
    { id: 146, title: "The Price of Pride", date: "70 days ago", isNew: false },
    { id: 145, title: "Unspoken Words", date: "77 days ago", isNew: false },
  ],
  related: [
    { id: 2, title: "The Villainess Reverses the Hourglass", cover: "https://picsum.photos/seed/villainess/300/420", genre: "Isekai Romance", rating: 9.4 },
    { id: 3, title: "I Became the Tyrant's Secretary", cover: "https://picsum.photos/seed/tyrant/300/420", genre: "Historical Romance", rating: 9.2 },
    { id: 4, title: "My Husband Hides His Beauty", cover: "https://picsum.photos/seed/husband/300/420", genre: "Fantasy Romance", rating: 9.5 },
  ],
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #080810; }
  ::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 4px; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }

  .fade-up { animation: fadeUp 0.5s ease both; }
  .fade-up-1 { animation-delay: 0.1s; }
  .fade-up-2 { animation-delay: 0.2s; }
  .fade-up-3 { animation-delay: 0.3s; }

  .gold-shimmer {
    background: linear-gradient(90deg, #c9a84c, #f0d080, #c9a84c);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }

  .chapter-row {
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    border-left: 2px solid transparent;
  }
  .chapter-row:hover {
    background: rgba(201,168,76,0.06) !important;
    border-left-color: rgba(201,168,76,0.4) !important;
  }

  .cta-btn { cursor: pointer; border: none; transition: all 0.2s ease; }
  .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(201,168,76,0.4) !important; }

  .ghost-btn { cursor: pointer; transition: all 0.2s ease; }
  .ghost-btn:hover { background: rgba(201,168,76,0.1) !important; border-color: rgba(201,168,76,0.5) !important; }

  .related-card { cursor: pointer; transition: transform 0.3s cubic-bezier(.22,.68,0,1.2), box-shadow 0.3s ease; }
  .related-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(0,0,0,0.6) !important; }
  .related-card:hover .related-img { transform: scale(1.05); }
  .related-img { transition: transform 0.4s ease; }

  .nav-link { cursor: pointer; transition: color 0.2s; }
  .nav-link:hover { color: #c9a84c !important; }

  .bookmark-btn { cursor: pointer; transition: all 0.2s; }
  .bookmark-btn:hover { border-color: rgba(201,168,76,0.5) !important; }

  .tab-btn { cursor: pointer; border: none; transition: all 0.2s; }
  .tab-btn:hover { color: #e8e0d0 !important; }
`;

export default function SeriesDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookmarked, setХадгалсан] = useState(false);
  const [activeTab, setActiveTab] = useState("chapters"); // chapters | details
  const [showAll, setShowAll] = useState(false);
  const [sortDesc, setSortDesc] = useState(true);

  const displayedБүлгүүд = showAll ? SERIES.chapters : SERIES.chapters.slice(0, 6);
  const sortedБүлгүүд = sortDesc ? displayedБүлгүүд : [...displayedБүлгүүд].reverse();

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

      {/* ── BANNER ── */}
      <div style={{ position: "relative", height: 280, overflow: "hidden" }}>
        <img src={SERIES.banner} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.35)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,8,16,0.2) 0%, rgba(8,8,16,0.95) 100%)" }} />
      </div>

      {/* ── SERIES INFO ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5%" }}>

        {/* Cover + Info row */}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 36, marginTop: -120, position: "relative", zIndex: 10, marginBottom: 48 }}>

          {/* Cover */}
          <div className="fade-up fade-up-1">
            <div style={{ borderRadius: 10, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.2)" }}>
              <img src={SERIES.cover} alt={SERIES.title} style={{ width: "100%", display: "block" }} />
            </div>
            {/* Action buttons under cover */}
            <button className="cta-btn" onClick={() => navigate(`/read/empress/156`)} style={{
              width: "100%", marginTop: 14,
              background: "linear-gradient(135deg, #c9a84c, #8a6020)",
              color: "#080810", padding: "13px",
              borderRadius: 6, fontSize: 13,
              fontFamily: "'Montserrat'", fontWeight: 500,
              letterSpacing: "0.1em", textTransform: "uppercase",
              boxShadow: "0 8px 24px rgba(201,168,76,0.3)",
            }}>▶ Уншиж эхлэх</button>
            <button className="ghost-btn bookmark-btn" onClick={() => setХадгалсан(!bookmarked)} style={{
              width: "100%", marginTop: 8,
              background: bookmarked ? "rgba(201,168,76,0.1)" : "transparent",
              border: `1px solid ${bookmarked ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.1)"}`,
              color: bookmarked ? "#c9a84c" : "rgba(232,224,208,0.5)",
              padding: "11px", borderRadius: 6, fontSize: 13,
              fontFamily: "'Montserrat'", fontWeight: 400,
              letterSpacing: "0.08em", textTransform: "uppercase",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {bookmarked ? "✦ Хадгалсан" : "☆ Хадгалах"}
            </button>
          </div>

          {/* Info */}
          <div style={{ paddingTop: 100 }}>
            <div className="fade-up fade-up-1" style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {SERIES.genre.map(g => (
                <span key={g} style={{
                  fontSize: 10, padding: "3px 10px", borderRadius: 3,
                  background: "rgba(201,168,76,0.1)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  color: "#c9a84c", fontFamily: "'Montserrat'",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                }}>{g}</span>
              ))}
              <span style={{
                fontSize: 10, padding: "3px 10px", borderRadius: 3,
                background: "rgba(100,180,100,0.1)",
                border: "1px solid rgba(100,180,100,0.2)",
                color: "#80c480", fontFamily: "'Montserrat'",
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>{SERIES.status}</span>
            </div>

            <h1 className="fade-up fade-up-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, lineHeight: 1.2, marginBottom: 16, color: "#e8e0d0" }}>
              {SERIES.title}
            </h1>

            {/* Rating + Stats */}
            <div className="fade-up fade-up-2" style={{ display: "flex", gap: 28, marginBottom: 24, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#c9a84c" }}>{SERIES.rating}</span>
                <span style={{ fontSize: 12, color: "rgba(232,224,208,0.4)", fontWeight: 300 }}>/ 10</span>
              </div>
              {[["👁", SERIES.views, "Views"], ["🔖", SERIES.bookmarks, "Bookmarks"], ["📖", `${SERIES.chapters.length}`, "Бүлгүүд"]].map(([icon, val, label]) => (
                <div key={label} style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: "#e8e0d0", fontFamily: "'Montserrat'" }}>{icon} {val}</span>
                  <span style={{ fontSize: 10, color: "rgba(232,224,208,0.35)", fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="fade-up fade-up-3" style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8, padding: "20px",
              marginBottom: 20,
            }}>
              <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "rgba(232,224,208,0.75)", whiteSpace: "pre-line" }}>
                {SERIES.description}
              </p>
            </div>

            {/* Author/Artist */}
            <div className="fade-up fade-up-3" style={{ display: "flex", gap: 24 }}>
              {[["Author", SERIES.author], ["Artist", SERIES.artist], ["Released", SERIES.released]].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 10, color: "rgba(232,224,208,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3, fontWeight: 300 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#c9a84c", fontWeight: 400 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 24, display: "flex", gap: 0 }}>
          {[["chapters", "Бүлгүүд"], ["details", "Дэлгэрэнгүй"]].map(([val, label]) => (
            <button key={val} className="tab-btn" onClick={() => setActiveTab(val)} style={{
              padding: "12px 24px", fontSize: 13,
              fontFamily: "'Montserrat'", fontWeight: activeTab === val ? 500 : 300,
              color: activeTab === val ? "#c9a84c" : "rgba(232,224,208,0.4)",
              background: "none", letterSpacing: "0.08em",
              textTransform: "uppercase",
              borderBottom: activeTab === val ? "2px solid #c9a84c" : "2px solid transparent",
              marginBottom: -1,
            }}>{label}</button>
          ))}
        </div>

        {activeTab === "chapters" && (
          <div style={{ marginBottom: 60 }}>
            {/* Sort */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: "rgba(232,224,208,0.4)", fontWeight: 300 }}>{SERIES.chapters.length} бүлэг нийт</span>
              <button onClick={() => setSortDesc(!sortDesc)} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6, padding: "6px 14px",
                fontSize: 11, color: "rgba(232,224,208,0.5)",
                fontFamily: "'Montserrat'", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                {sortDesc ? "↓ Шинээр нэмэгдсэн" : "↑ Хуучнаас шинэ"}
              </button>
            </div>

            {/* Chapter list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {sortedБүлгүүд.map((ch) => (
                <div key={ch.id} className="chapter-row" onClick={() => navigate(`/read/empress/${ch.id}`)} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderLeft: "2px solid transparent",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 12, color: "#c9a84c", fontFamily: "'Montserrat'", fontWeight: 500, minWidth: 52 }}>Ch. {ch.id}</span>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#e8e0d0" }}>{ch.title}</span>
                    {ch.isNew && (
                      <span style={{
                        fontSize: 9, padding: "2px 8px", borderRadius: 3,
                        background: "linear-gradient(135deg, #c9a84c, #8a6020)",
                        color: "#080810", fontWeight: 500,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                      }}>New</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 11, color: "rgba(232,224,208,0.3)", fontWeight: 300 }}>{ch.date}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                </div>
              ))}
            </div>

            {/* Show more */}
            {!showAll && SERIES.chapters.length > 6 && (
              <button onClick={() => setShowAll(true)} className="ghost-btn" style={{
                width: "100%", marginTop: 12,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6, padding: "12px",
                fontSize: 12, color: "rgba(232,224,208,0.4)",
                fontFamily: "'Montserrat'", letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>
                Бүгдийг харах {SERIES.chapters.length} Бүлгүүд ↓
              </button>
            )}
          </div>
        )}

        {activeTab === "details" && (
          <div style={{ marginBottom: 60 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 600 }}>
              {[
                ["Title", SERIES.title],
                ["Author", SERIES.author],
                ["Artist", SERIES.artist],
                ["Status", SERIES.status],
                ["Released", SERIES.released],
                ["Total Бүлгүүд", SERIES.chapters.length],
                ["Views", SERIES.views],
                ["Bookmarks", SERIES.bookmarks],
              ].map(([label, val]) => (
                <div key={label} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 8, padding: "14px 16px",
                }}>
                  <div style={{ fontSize: 10, color: "rgba(232,224,208,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5, fontWeight: 300 }}>{label}</div>
                  <div style={{ fontSize: 14, color: "#e8e0d0", fontWeight: 400 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RELATED SERIES ── */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>✦ Танд таалагдаж болох</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#e8e0d0" }}>Төстэй цуврал</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {SERIES.related.map(s => (
              <div key={s.id} className="related-card" style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 8, overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              }}>
                <div style={{ position: "relative", paddingBottom: "140%", overflow: "hidden" }}>
                  <img className="related-img" src={s.cover} alt={s.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,16,0.8) 0%, transparent 60%)" }} />
                  <div style={{
                    position: "absolute", top: 10, right: 10,
                    background: "rgba(8,8,16,0.7)", backdropFilter: "blur(8px)",
                    borderRadius: 3, padding: "3px 8px",
                    display: "flex", alignItems: "center", gap: 4,
                    border: "1px solid rgba(201,168,76,0.2)",
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <span style={{ fontSize: 11, color: "#c9a84c", fontFamily: "'Montserrat'", fontWeight: 500 }}>{s.rating}</span>
                  </div>
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 500, color: "#e8e0d0", marginBottom: 5, lineHeight: 1.3 }}>{s.title}</h3>
                  <span style={{ fontSize: 11, color: "#c9a84c", fontFamily: "'Montserrat'", fontWeight: 300 }}>{s.genre}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(201,168,76,0.1)", padding: "24px 5%", background: "rgba(0,0,0,0.3)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 26, height: 26, background: "linear-gradient(135deg, #c9a84c, #8a6020)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>⬡</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "rgba(232,224,208,0.6)" }}>KOKORO Manhwa</span>
          </div>
          <p style={{ fontFamily: "'Montserrat'", fontSize: 11, fontWeight: 300, color: "rgba(232,224,208,0.25)", letterSpacing: "0.08em" }}>© 2025 · Crafted for Mongolian readers</p>
        </div>
      </footer>
    </div>
  );
}