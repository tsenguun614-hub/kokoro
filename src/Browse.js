import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useWindowSize from "./useWindowSize";
const width = useWindowSize();
const isMobile = width < 768;

const ALL_SERIES = [
  { id: 1, title: "The Remarried Empress", cover: "https://picsum.photos/seed/empress/300/420", genre: "Royal Romance", chapters: 156, status: "Ongoing", rating: 9.8, views: "2.4M", isHot: true, isNew: false, updated: "2 hours ago" },
  { id: 2, title: "My Husband Hides His Beauty", cover: "https://picsum.photos/seed/husband/300/420", genre: "Fantasy Romance", chapters: 89, status: "Ongoing", rating: 9.5, views: "1.1M", isHot: false, isNew: true, updated: "5 hours ago" },
  { id: 3, title: "A Business Proposal", cover: "https://picsum.photos/seed/business/300/420", genre: "Modern Romance", chapters: 128, status: "Completed", rating: 9.6, views: "1.8M", isHot: true, isNew: false, updated: "1 day ago" },
  { id: 4, title: "The Villainess Reverses the Hourglass", cover: "https://picsum.photos/seed/villainess/300/420", genre: "Isekai Romance", chapters: 112, status: "Ongoing", rating: 9.4, views: "980K", isHot: false, isNew: false, updated: "2 days ago" },
  { id: 5, title: "I Became the Tyrant's Secretary", cover: "https://picsum.photos/seed/tyrant/300/420", genre: "Historical Romance", chapters: 67, status: "Ongoing", rating: 9.2, views: "640K", isHot: false, isNew: true, updated: "3 hours ago" },
  { id: 6, title: "Beware of the Villainess", cover: "https://picsum.photos/seed/beware/300/420", genre: "Dark Romance", chapters: 95, status: "Completed", rating: 9.3, views: "720K", isHot: false, isNew: false, updated: "3 days ago" },
  { id: 7, title: "The Duchess Has a Deathwish", cover: "https://picsum.photos/seed/duchess/300/420", genre: "Dark Romance", chapters: 44, status: "Ongoing", rating: 9.1, views: "410K", isHot: false, isNew: true, updated: "6 hours ago" },
  { id: 8, title: "I'll Be the Matriarch in This Life", cover: "https://picsum.photos/seed/matriarch/300/420", genre: "Isekai Romance", chapters: 133, status: "Ongoing", rating: 9.0, views: "870K", isHot: true, isNew: false, updated: "1 day ago" },
  { id: 9, title: "The Emperor Wants to Divorce", cover: "https://picsum.photos/seed/emperor/300/420", genre: "Royal Romance", chapters: 78, status: "Ongoing", rating: 8.9, views: "530K", isHot: false, isNew: false, updated: "4 days ago" },
  { id: 10, title: "Office Romance at Midnight", cover: "https://picsum.photos/seed/office/300/420", genre: "Modern Romance", chapters: 52, status: "Ongoing", rating: 8.8, views: "390K", isHot: false, isNew: true, updated: "8 hours ago" },
  { id: 11, title: "The Maid and the Beast", cover: "https://picsum.photos/seed/maid/300/420", genre: "Fantasy Romance", chapters: 61, status: "Completed", rating: 9.0, views: "450K", isHot: false, isNew: false, updated: "5 days ago" },
  { id: 12, title: "Her Secret Bodyguard", cover: "https://picsum.photos/seed/bodyguard/300/420", genre: "Modern Romance", chapters: 88, status: "Ongoing", rating: 8.7, views: "310K", isHot: false, isNew: false, updated: "2 days ago" },
];

const GENRES = ["All", "Royal Romance", "Fantasy Romance", "Modern Romance", "Isekai Romance", "Historical Romance", "Dark Romance"];
const SORT_OPTIONS = [
  { value: "popular", label: "Их Үзэлттэй" },
  { value: "rating", label: "Өндөр Үнэлгээтэй" },
  { value: "newest", label: "Шинээр нэмэгдсэн" },
  { value: "chapters", label: "Олон бүлэгтэй" },
];
const STATUS_OPTIONS = ["Бүгд", "ГАРЧ БАЙГАА", "ДУУССАН"];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #080810; }
  ::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 4px; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }

  .fade-up { animation: fadeUp 0.4s ease both; }

  .manga-card {
    cursor: pointer;
    transition: transform 0.35s cubic-bezier(.22,.68,0,1.2), box-shadow 0.35s ease;
  }
  .manga-card:hover {
    transform: translateY(-7px);
    box-shadow: 0 22px 55px rgba(0,0,0,0.65), 0 0 0 1px rgba(201,168,76,0.25) !important;
  }
  .manga-card:hover .card-img { transform: scale(1.06); }
  .manga-card:hover .read-overlay { opacity: 1 !important; }
  .card-img { transition: transform 0.45s ease; }

  .nav-link { cursor: pointer; transition: color 0.2s; }
  .nav-link:hover { color: #c9a84c !important; }

  .genre-pill { cursor: pointer; border: none; transition: all 0.18s ease; }
  .genre-pill:hover { opacity: 0.85; }

  .filter-select {
    cursor: pointer;
    transition: border-color 0.2s;
  }
  .filter-select:hover { border-color: rgba(201,168,76,0.4) !important; }
  .filter-select:focus { border-color: rgba(201,168,76,0.5) !important; outline: none; }

  .view-btn { cursor: pointer; border: none; transition: all 0.15s; }
  .view-btn:hover { color: #c9a84c !important; }

  .list-row {
    cursor: pointer;
    transition: background 0.15s, border-left-color 0.15s;
    border-left: 2px solid transparent;
  }
  .list-row:hover {
    background: rgba(201,168,76,0.05) !important;
    border-left-color: rgba(201,168,76,0.35) !important;
  }

  .search-input:focus { border-color: rgba(201,168,76,0.5) !important; outline: none; }

  .gold-shimmer {
    background: linear-gradient(90deg, #c9a84c, #f0d080, #c9a84c);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }
`;

export default function Browse() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeGenre, setActiveGenre] = useState("All");
  const [activeStatus, setActiveStatus] = useState("Бүгд");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [search, setSearch] = useState("");

  const filtered = ALL_SERIES
    .filter(s => activeGenre === "All" || s.genre === activeGenre)
    .filter(s => activeStatus === "Бүгд" || (activeStatus === "ГАРЧ БАЙГАА" && s.status === "Ongoing") || (activeStatus === "ДУУССАН" && s.status === "Completed"))
    .filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "popular") return parseFloat(b.views) - parseFloat(a.views);
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "chapters") return b.chapters - a.chapters;
      return 0;
    });

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

      {/* ── PAGE HERO ── */}
      <div style={{ padding: "48px 5% 36px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 6, fontSize: 10, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase" }}>✦ Full Collection</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: "#e8e0d0", marginBottom: 8 }}>
          Browse <span className="gold-shimmer">Бүх цуврал</span>
        </h1>
        <p style={{ fontSize: 13, fontWeight: 300, color: "rgba(232,224,208,0.45)", letterSpacing: "0.02em" }}>
          {ALL_SERIES.length} series · Updated daily
        </p>
      </div>

      {/* ── FILTERS ── */}
      <div style={{ padding: "0 5% 32px", maxWidth: 1200, margin: "0 auto" }}>

        {/* Genre pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {GENRES.map(g => (
            <button key={g} className="genre-pill" onClick={() => setActiveGenre(g)} style={{
              padding: "7px 16px", borderRadius: 4,
              fontSize: 11, fontFamily: "'Montserrat'",
              fontWeight: 400, letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: activeGenre === g ? "linear-gradient(135deg, #c9a84c, #8a6020)" : "rgba(255,255,255,0.04)",
              color: activeGenre === g ? "#080810" : "rgba(232,224,208,0.45)",
              border: activeGenre === g ? "none" : "1px solid rgba(255,255,255,0.08)",
              boxShadow: activeGenre === g ? "0 4px 14px rgba(201,168,76,0.3)" : "none",
            }}>{g}</button>
          ))}
        </div>

        {/* Second row: status + sort + view toggle */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {/* Status filter */}
          <div style={{ display: "flex", gap: 6 }}>
            {STATUS_OPTIONS.map(s => (
              <button key={s} className="genre-pill" onClick={() => setActiveStatus(s)} style={{
                padding: "6px 14px", borderRadius: 4,
                fontSize: 11, fontFamily: "'Montserrat'",
                fontWeight: 400, letterSpacing: "0.06em",
                background: activeStatus === s ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)",
                color: activeStatus === s ? "#c9a84c" : "rgba(232,224,208,0.35)",
                border: `1px solid ${activeStatus === s ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.06)"}`,
              }}>{s}</button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Sort */}
          <select
            className="filter-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6, padding: "7px 14px",
              fontSize: 12, color: "rgba(232,224,208,0.7)",
              fontFamily: "'Montserrat'", fontWeight: 300,
            }}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: "#12121e" }}>{o.label}</option>)}
          </select>

          {/* View mode toggle */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, overflow: "hidden" }}>
            {[["grid", "⊞"], ["list", "☰"]].map(([mode, icon]) => (
              <button key={mode} className="view-btn" onClick={() => setViewMode(mode)} style={{
                padding: "7px 13px", fontSize: 15,
                color: viewMode === mode ? "#c9a84c" : "rgba(232,224,208,0.3)",
                background: viewMode === mode ? "rgba(201,168,76,0.1)" : "transparent",
              }}>{icon}</button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div style={{ marginTop: 16, fontSize: 12, color: "rgba(232,224,208,0.3)", fontWeight: 300 }}>
          Showing {filtered.length} series
          {activeGenre !== "All" && <span style={{ color: "#c9a84c" }}> · {activeGenre}</span>}
          {activeStatus !== "All" && <span style={{ color: "rgba(232,224,208,0.5)" }}> · {activeStatus}</span>}
          {search && <span style={{ color: "rgba(232,224,208,0.5)" }}> · "{search}"</span>}
        </div>
      </div>

      {/* ── SERIES DISPLAY ── */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5% 80px" }}>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "rgba(232,224,208,0.5)", marginBottom: 8 }}>No series found</h3>
            <p style={{ fontSize: 13, color: "rgba(232,224,208,0.3)", fontWeight: 300 }}>Try a different filter or search term</p>
          </div>
        ) : viewMode === "grid" ? (

          /* ── GRID VIEW ── */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {filtered.map((series, i) => (
              <div
                key={series.id}
                className="manga-card fade-up"
                style={{ animationDelay: `${i * 0.04}s`, background: "rgba(255,255,255,0.03)", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
                onClick={() => navigate(`/series/${series.id}`)}
              >
                <div style={{ position: "relative", paddingBottom: "145%", overflow: "hidden" }}>
                  <img className="card-img" src={series.cover} alt={series.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,16,0.9) 0%, rgba(8,8,16,0.2) 50%, transparent 75%)" }} />

                  {/* Badges */}
                  <div style={{ position: "absolute", top: 8, left: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                    {series.isNew && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 2, background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase" }}>New</span>}
                    {series.isHot && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 2, background: "rgba(200,70,60,0.85)", color: "white", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>🔥 Hot</span>}
                  </div>

                  {/* Rating */}
                  <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(8,8,16,0.75)", backdropFilter: "blur(8px)", borderRadius: 3, padding: "3px 7px", display: "flex", alignItems: "center", gap: 3, border: "1px solid rgba(201,168,76,0.2)" }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <span style={{ fontSize: 10, color: "#c9a84c", fontFamily: "'Montserrat'", fontWeight: 500 }}>{series.rating}</span>
                  </div>

                  {/* Read overlay */}
                  <div className="read-overlay" style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px", opacity: 0, transition: "opacity 0.25s" }}>
                    <div style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "8px", borderRadius: 3, fontSize: 10, fontFamily: "'Montserrat'", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center" }}>Read Now</div>
                  </div>
                </div>

                <div style={{ padding: "12px 12px 14px" }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 500, color: "#e8e0d0", marginBottom: 5, lineHeight: 1.3 }}>{series.title}</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: "#c9a84c", fontFamily: "'Montserrat'", fontWeight: 300 }}>{series.genre}</span>
                    <span style={{ fontSize: 10, color: "rgba(232,224,208,0.3)", fontFamily: "'Montserrat'" }}>{series.chapters} ch</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 2, background: series.status === "Completed" ? "rgba(100,180,100,0.1)" : "rgba(201,168,76,0.1)", color: series.status === "Completed" ? "#80c480" : "#c9a84c", border: `1px solid ${series.status === "Completed" ? "rgba(100,180,100,0.2)" : "rgba(201,168,76,0.2)"}`, letterSpacing: "0.08em", textTransform: "uppercase" }}>{series.status === "Completed" ? "ДУУССАН" : "ГАРЧ БАЙГАА"}</span>
                    <span style={{ fontSize: 10, color: "rgba(232,224,208,0.25)", fontFamily: "'Montserrat'", fontWeight: 300 }}>{series.views} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        ) : (

          /* ── LIST VIEW ── */
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {filtered.map((series, i) => (
              <div
                key={series.id}
                className="list-row fade-up"
                style={{ animationDelay: `${i * 0.03}s`, display: "flex", gap: 16, alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}
                onClick={() => navigate(`/series/${series.id}`)}
              >
                {/* Rank */}
                <span style={{ fontSize: 13, color: i < 3 ? "#c9a84c" : "rgba(232,224,208,0.2)", fontFamily: "'Playfair Display', serif", fontWeight: 700, minWidth: 24, textAlign: "center" }}>{i + 1}</span>

                {/* Cover thumb */}
                <img src={series.cover} alt="" style={{ width: 44, height: 60, borderRadius: 4, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(201,168,76,0.1)" }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 500, color: "#e8e0d0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{series.title}</h3>
                    {series.isNew && <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 2, background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>New</span>}
                    {series.isHot && <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 2, background: "rgba(200,70,60,0.8)", color: "white", fontWeight: 500, flexShrink: 0 }}>🔥</span>}
                  </div>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#c9a84c", fontWeight: 300 }}>{series.genre}</span>
                    <span style={{ fontSize: 10, color: "rgba(232,224,208,0.3)" }}>·</span>
                    <span style={{ fontSize: 11, color: "rgba(232,224,208,0.35)", fontWeight: 300 }}>{series.chapters} chapters</span>
                    <span style={{ fontSize: 10, color: "rgba(232,224,208,0.3)" }}>·</span>
                    <span style={{ fontSize: 11, color: "rgba(232,224,208,0.35)", fontWeight: 300 }}>Updated {series.updated}</span>
                  </div>
                </div>

                {/* Rating */}
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <span style={{ fontSize: 13, color: "#c9a84c", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>{series.rating}</span>
                </div>

                {/* Status */}
                <span style={{ fontSize: 9, padding: "3px 9px", borderRadius: 2, background: series.status === "Completed" ? "rgba(100,180,100,0.1)" : "rgba(201,168,76,0.1)", color: series.status === "Completed" ? "#80c480" : "#c9a84c", border: `1px solid ${series.status === "Completed" ? "rgba(100,180,100,0.2)" : "rgba(201,168,76,0.2)"}`, letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>{series.status === "Completed" ? "ДУУССАН" : "ГАРЧ БАЙГАА"}</span>

                {/* Views */}
                <span style={{ fontSize: 11, color: "rgba(232,224,208,0.3)", fontWeight: 300, minWidth: 52, textAlign: "right" }}>{series.views}</span>

                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            ))}
          </div>
        )}
      </main>

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