import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const featuredSeries = [
  {
    id: 1,
    title: "The Remarried Empress",
    cover: "https://picsum.photos/seed/empress/300/420",
    genre: "Royal Romance",
    chapters: 156,
    status: "Ongoing",
    rating: 9.8,
    isNew: false,
    isHot: true,
    description: "A queen abandoned by her emperor finds a dangerous new love in the shadows of power.",
  },
  {
    id: 2,
    title: "My Husband Hides His Beauty",
    cover: "https://picsum.photos/seed/husband/300/420",
    genre: "Fantasy Romance",
    chapters: 89,
    status: "Ongoing",
    rating: 9.5,
    isNew: true,
    isHot: false,
    description: "She married a man rumored to be hideous. The truth is far more dangerous.",
  },
  {
    id: 3,
    title: "A Business Proposal",
    cover: "https://picsum.photos/seed/business/300/420",
    genre: "Modern Romance",
    chapters: 128,
    status: "Completed",
    rating: 9.6,
    isNew: false,
    isHot: true,
    description: "Standing in for her friend at a blind date leads to an unexpected engagement.",
  },
  {
    id: 4,
    title: "The Villainess Reverses the Hourglass",
    cover: "https://picsum.photos/seed/villainess/300/420",
    genre: "Isekai Romance",
    chapters: 112,
    status: "Ongoing",
    rating: 9.4,
    isNew: false,
    isHot: false,
    description: "Given a second chance, she will rewrite her tragic fate with ruthless precision.",
  },
  {
    id: 5,
    title: "I Became the Tyrant's Secretary",
    cover: "https://picsum.photos/seed/tyrant/300/420",
    genre: "Historical Romance",
    chapters: 67,
    status: "Ongoing",
    rating: 9.2,
    isNew: true,
    isHot: false,
    description: "Working for the most feared man in the empire was never part of her plan.",
  },
  {
    id: 6,
    title: "Beware of the Villainess",
    cover: "https://picsum.photos/seed/beware/300/420",
    genre: "Dark Romance",
    chapters: 95,
    status: "Completed",
    rating: 9.3,
    isNew: false,
    isHot: false,
    description: "She woke up as the villainess — and she has absolutely no patience for nonsense.",
  },
];

const newChapters = [
  { id: 1, title: "The Remarried Empress", chapter: "Ch. 156", time: "2 hours ago", cover: "https://picsum.photos/seed/empress/60/80" },
  { id: 2, title: "My Husband Hides His Beauty", chapter: "Ch. 89", time: "5 hours ago", cover: "https://picsum.photos/seed/husband/60/80" },
  { id: 5, title: "I Became the Tyrant's Secretary", chapter: "Ch. 67", time: "8 hours ago", cover: "https://picsum.photos/seed/tyrant/60/80" },
  { id: 4, title: "The Villainess Reverses", chapter: "Ch. 112", time: "1 day ago", cover: "https://picsum.photos/seed/villainess/60/80" },
  { id: 6, title: "Beware of the Villainess", chapter: "Ch. 95", time: "1 day ago", cover: "https://picsum.photos/seed/beware/60/80" },
];

const genres = ["All", "Royal Romance", "Fantasy", "Modern", "Isekai", "Historical", "Dark Romance"];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #080810; }
  ::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 4px; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 12px rgba(201,168,76,0.3); } 50% { box-shadow: 0 0 28px rgba(201,168,76,0.6); } }
  @keyframes float { 0%, 100% { transform: translateY(0px) rotate(var(--r)); } 50% { transform: translateY(-8px) rotate(var(--r)); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .fade-up { animation: fadeUp 0.7s ease both; }
  .fade-up-1 { animation-delay: 0.1s; }
  .fade-up-2 { animation-delay: 0.22s; }
  .fade-up-3 { animation-delay: 0.34s; }
  .fade-up-4 { animation-delay: 0.46s; }

  .gold-shimmer {
    background: linear-gradient(90deg, #c9a84c, #f0d080, #c9a84c, #f0d080);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 4s linear infinite;
  }

  .manga-card { transition: transform 0.4s cubic-bezier(.22,.68,0,1.2), box-shadow 0.4s ease; cursor: pointer; }
  .manga-card:hover { transform: translateY(-8px); box-shadow: 0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.3) !important; }
  .manga-card:hover .card-img { transform: scale(1.05); }
  .manga-card:hover .overlay-btn { opacity: 1 !important; }
  .card-img { transition: transform 0.4s ease; }

  .nav-link { cursor: pointer; transition: color 0.2s; text-decoration: none; }
  .nav-link:hover { color: #c9a84c !important; }

  .genre-btn { transition: all 0.2s ease; cursor: pointer; border: none; }
  .genre-btn:hover { opacity: 0.8; }

  .chapter-row { transition: background 0.2s; cursor: pointer; border-radius: 10px; }
  .chapter-row:hover { background: rgba(201,168,76,0.07) !important; }

  .cta-btn { transition: all 0.2s ease; cursor: pointer; border: none; }
  .cta-btn:hover { background: #b8943a !important; transform: scale(1.02); }

  .ghost-btn { cursor: pointer; transition: all 0.2s ease; }
  .ghost-btn:hover { background: rgba(201,168,76,0.1) !important; border-color: rgba(201,168,76,0.6) !important; }

  .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
`;

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeGenre, setActiveGenre] = useState("All");
  const [loaded, setLoaded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const filtered = activeGenre === "All"
    ? featuredSeries
    : featuredSeries.filter(s => s.genre.toLowerCase().includes(activeGenre.toLowerCase()));

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/browse`)
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#e8e0d0", fontFamily: "'Montserrat', sans-serif", opacity: 1, position: "relative", overflow: "hidden" }}>
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
      <div className="orb" style={{ width: 600, height: 600, background: "rgba(100,60,160,0.12)", top: -200, right: -100 }} />
      <div className="orb" style={{ width: 400, height: 400, background: "rgba(201,168,76,0.06)", top: 300, left: -150 }} />
      <div className="orb" style={{ width: 300, height: 300, background: "rgba(160,60,80,0.08)", bottom: 200, right: 100 }} />

      {/* ── HERO ── */}
      <section style={{ padding: "60px 5% 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(100,60,160,0.1) 50%, rgba(160,60,80,0.08) 100%)", borderRadius: 24, padding: "50px 60px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden", border: "1px solid rgba(201,168,76,0.12)" }}>
          <div style={{ position: "absolute", top: -40, right: 200, width: 200, height: 200, borderRadius: "50%", background: "rgba(201,168,76,0.06)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, right: 80, width: 280, height: 280, borderRadius: "50%", background: "rgba(100,60,160,0.06)", pointerEvents: "none" }} />

          <div style={{ maxWidth: 520, position: "relative", zIndex: 1 }}>
            <div className="fade-up fade-up-1" style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid rgba(201,168,76,0.3)", borderRadius: 3, padding: "5px 14px", marginBottom: 20 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#c9a84c", display: "inline-block" }} />
              <span style={{ fontSize: 10, color: "#c9a84c", fontFamily: "'Montserrat'", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 400 }}>Өнөөдөр 5 шинэ бүлэг</span>
            </div>

            <h1 className="fade-up fade-up-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: 54, fontWeight: 700, lineHeight: 1.1, marginBottom: 8, color: "#e8e0d0" }}>
              Хайрын түүх
            </h1>
            <h1 className="fade-up fade-up-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: 54, fontWeight: 700, lineHeight: 1.1, marginBottom: 24, fontStyle: "italic" }}>
              <span className="gold-shimmer">Эндээс эхэлнэ.</span>
            </h1>

            <p className="fade-up fade-up-3" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 300, color: "rgba(232,224,208,0.6)", lineHeight: 1.8, marginBottom: 32 }}>
              Монгол хэлээр хамгийн шилдэг роман манхва уншаарай.<br />
              Шилмэл манхва. Анхааралтай орчуулсан.
            </p>

            <div className="fade-up fade-up-4" style={{ display: "flex", gap: 14 }}>
              <button className="cta-btn" onClick={() => navigate("/browse")} style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "13px 28px", borderRadius: 4, fontSize: 12, fontFamily: "'Montserrat'", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", boxShadow: "0 8px 28px rgba(201,168,76,0.25)" }}>Уншиж эхлэх</button>
              <button className="ghost-btn" onClick={() => navigate("/browse")} style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c", padding: "13px 28px", borderRadius: 4, fontSize: 12, fontFamily: "'Montserrat'", fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase" }}>Бүгдийг үзэх</button>
            </div>

            <div className="fade-up fade-up-4" style={{ display: "flex", gap: 36, marginTop: 48 }}>
              {[["48", "Цуврал"], ["3.2K", "Бүлэг"], ["12K+", "Уншигч"]].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#c9a84c" }}>{val}</div>
                  <div style={{ fontFamily: "'Montserrat'", fontSize: 11, fontWeight: 300, color: "rgba(232,224,208,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating covers */}
          <div style={{ position: "relative", width: 260, height: 220, flexShrink: 0 }}>
            {[2, 1, 0].map((i) => (
              <div key={i} onClick={() => navigate(`/series/${featuredSeries[i].id}`)} style={{ position: "absolute", width: 120, height: 170, borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 36px rgba(0,0,0,0.6)", left: i === 0 ? 70 : i === 1 ? 35 : 0, top: i === 0 ? 20 : i === 1 ? 10 : 0, transform: `rotate(${i === 0 ? 6 : i === 1 ? 2 : -4}deg)`, border: "1px solid rgba(201,168,76,0.15)", zIndex: i, cursor: "pointer", "--r": `${i === 0 ? 6 : i === 1 ? 2 : -4}deg`, animation: `float ${3.5 + i * 0.7}s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }}>
                <img src={featuredSeries[i].cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,16,0.5) 0%, transparent 60%)" }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto 40px", padding: "0 5%" }}>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)" }} />
      </div>

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5% 60px", display: "grid", gridTemplateColumns: "1fr 300px", gap: 40 }}>

        {/* Left */}
        <div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 10, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>✦ Шилмэл</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#e8e0d0" }}>Онцлох цуврал</h2>
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {genres.map(g => (
                <button key={g} className="genre-btn" onClick={() => setActiveGenre(g)} style={{ padding: "6px 14px", borderRadius: 3, fontSize: 11, fontFamily: "'Montserrat'", fontWeight: 400, letterSpacing: "0.08em", background: activeGenre === g ? "linear-gradient(135deg, #c9a84c, #8a6020)" : "rgba(255,255,255,0.04)", color: activeGenre === g ? "#080810" : "rgba(232,224,208,0.45)", border: activeGenre === g ? "none" : "1px solid rgba(255,255,255,0.08)", textTransform: "uppercase", boxShadow: activeGenre === g ? "0 4px 14px rgba(201,168,76,0.3)" : "none" }}>{g}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {filtered.map((series) => (
              <div key={series.id} className="manga-card" onMouseEnter={() => setHoveredCard(series.id)} onMouseLeave={() => setHoveredCard(null)} onClick={() => navigate(`/series/${series.id}`)} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)", position: "relative" }}>
                <div style={{ position: "relative", paddingBottom: "140%", overflow: "hidden" }}>
                  <img className="card-img" src={series.cover} alt={series.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: hoveredCard === series.id ? "scale(1.05)" : "scale(1)" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,16,0.9) 0%, rgba(8,8,16,0.3) 45%, transparent 70%)" }} />
                  <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                    {series.isNew && <span style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", fontSize: 9, padding: "3px 8px", borderRadius: 2, fontFamily: "'Montserrat'", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase" }}>Шинэ</span>}
                    {series.isHot && <span style={{ background: "rgba(200,70,60,0.85)", color: "white", fontSize: 9, padding: "3px 8px", borderRadius: 2, fontFamily: "'Montserrat'", fontWeight: 500 }}>🔥 Hot</span>}
                  </div>
                  <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(8,8,16,0.75)", backdropFilter: "blur(8px)", borderRadius: 3, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4, border: "1px solid rgba(201,168,76,0.2)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <span style={{ fontSize: 11, color: "#c9a84c", fontFamily: "'Montserrat'", fontWeight: 500 }}>{series.rating}</span>
                  </div>
                  <button className="overlay-btn" style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", border: "none", padding: "8px 20px", borderRadius: 3, fontSize: 11, fontFamily: "'Montserrat'", fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", opacity: 0, transition: "opacity 0.3s", letterSpacing: "0.08em", textTransform: "uppercase" }}>Унших</button>
                </div>
                <div style={{ padding: "14px 14px 16px" }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 500, color: "#e8e0d0", marginBottom: 6, lineHeight: 1.3 }}>{series.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "#c9a84c", fontFamily: "'Montserrat'", fontWeight: 300 }}>{series.genre}</span>
                    <span style={{ fontSize: 10, color: "rgba(232,224,208,0.3)", fontFamily: "'Montserrat'" }}>{series.chapters} бүлэг</span>
                  </div>
                  <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 2, background: series.status === "Completed" ? "rgba(100,180,100,0.1)" : "rgba(201,168,76,0.1)", color: series.status === "Completed" ? "#80c480" : "#c9a84c", fontFamily: "'Montserrat'", letterSpacing: "0.08em", textTransform: "uppercase", border: `1px solid ${series.status === "Completed" ? "rgba(100,180,100,0.2)" : "rgba(201,168,76,0.2)"}` }}>{series.status === "Completed" ? "Дууссан" : "Гарч байна"}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 28 }}>
            <button onClick={() => navigate("/browse")} className="ghost-btn" style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.25)", color: "#c9a84c", padding: "11px 28px", borderRadius: 4, fontSize: 12, fontFamily: "'Montserrat'", fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase" }}>Бүх цувралыг үзэх →</button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Latest Updates */}
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "22px", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#e8e0d0" }}>Шинээр Нэмэгдсэн</h3>
              <span onClick={() => navigate("/browse")} style={{ fontSize: 10, color: "#c9a84c", fontFamily: "'Montserrat'", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>Бүгд →</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {newChapters.map((ch, i) => (
                <div key={i} className="chapter-row" onClick={() => navigate(`/series/${ch.id}`)} style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 6px" }}>
                  <img src={ch.cover} alt="" style={{ width: 40, height: 54, borderRadius: 4, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(201,168,76,0.1)" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 12, fontWeight: 500, color: "#e8e0d0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.title}</div>
                    <div style={{ fontFamily: "'Montserrat'", fontSize: 11, color: "#c9a84c", marginTop: 2, fontWeight: 300 }}>{ch.chapter}</div>
                    <div style={{ fontFamily: "'Montserrat'", fontSize: 10, color: "rgba(232,224,208,0.3)", marginTop: 1 }}>{ch.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(100,60,160,0.08))", borderRadius: 8, padding: "22px", border: "1px solid rgba(201,168,76,0.15)" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#e8e0d0", marginBottom: 16 }}>Нийт Сан</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[["48", "Цуврал"], ["3.2K", "Бүлэг"], ["12K", "Уншигч"], ["Өдөр бүр", "Шинэчлэл"]].map(([val, label]) => (
                <div key={label} style={{ background: "rgba(8,8,16,0.4)", borderRadius: 8, padding: "12px", textAlign: "center", border: "1px solid rgba(201,168,76,0.1)" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#c9a84c" }}>{val}</div>
                  <div style={{ fontFamily: "'Montserrat'", fontSize: 10, color: "rgba(232,224,208,0.4)", fontWeight: 300, letterSpacing: "0.05em" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Genre quick links */}
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "22px", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#e8e0d0", marginBottom: 16 }}>Төрлөөр үзэх</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {["Royal Romance", "Fantasy Romance", "Modern Romance", "Isekai Romance", "Historical Romance", "Dark Romance"].map(g => (
                <div key={g} onClick={() => navigate(`/search?genre=${encodeURIComponent(g)}`)} className="chapter-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 10px" }}>
                  <span style={{ fontSize: 13, color: "rgba(232,224,208,0.6)", fontWeight: 300 }}>{g}</span>
                  <span style={{ fontSize: 11, color: "#c9a84c" }}>→</span>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "22px", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 24, marginBottom: 10, textAlign: "center" }}>✦</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#e8e0d0", textAlign: "center", marginBottom: 8 }}>Бүлгийг бүү алдаарай</h3>
            <p style={{ fontFamily: "'Montserrat'", fontSize: 12, color: "rgba(232,224,208,0.4)", textAlign: "center", marginBottom: 16, lineHeight: 1.5, fontWeight: 300 }}>Дуртай цувралынхаа шинэ бүлэг гарахад мэдэгдэл авах</p>
            <input placeholder="И-мэйл хаяг" style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 4, outline: "none", fontFamily: "'Montserrat'", fontSize: 12, color: "#e8e0d0", marginBottom: 10, fontWeight: 300 }} />
            <button onClick={() => navigate("/auth")} style={{ width: "100%", background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "10px", borderRadius: 4, fontSize: 11, fontFamily: "'Montserrat'", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: "pointer", boxShadow: "0 6px 18px rgba(201,168,76,0.3)" }}>Бүртгүүлэх ✦</button>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(201,168,76,0.1)", padding: "30px 5%", background: "rgba(0,0,0,0.3)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
            <div style={{ width: 26, height: 26, background: "linear-gradient(135deg, #c9a84c, #8a6020)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>⬡</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "rgba(232,224,208,0.6)" }}>KOKORO Manhwa</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[["Бидний тухай", "/"], ["Холбоо барих", "/"], ["DMCA", "/"]].map(([label, path]) => (
              <span key={label} className="nav-link" onClick={() => navigate(path)} style={{ fontFamily: "'Montserrat'", fontSize: 11, fontWeight: 300, color: "rgba(232,224,208,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
            ))}
          </div>
          <p style={{ fontFamily: "'Montserrat'", fontSize: 11, fontWeight: 300, color: "rgba(232,224,208,0.25)", letterSpacing: "0.08em" }}>© 2025 · Монгол уншигчдад зориулав</p>
        </div>
      </footer>
    </div>
  );
}