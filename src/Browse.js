import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useWindowSize from "./useWindowSize";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { MAX_W, PLAYFAIR_MONTSERRAT_FONTS, baseCss } from "./sharedStyles";

const ALL_SERIES = [
  { id: 1, title: "The Remarried Empress", cover: "https://picsum.photos/seed/empress/300/420", genre: "Royal Romance", chapters: 156, status: "Ongoing", rating: 9.8, views: "2.4M", isHot: true, isNew: false, updated: "2 цагийн өмнө" },
  { id: 2, title: "My Husband Hides His Beauty", cover: "https://picsum.photos/seed/husband/300/420", genre: "Fantasy Romance", chapters: 89, status: "Ongoing", rating: 9.5, views: "1.1M", isHot: false, isNew: true, updated: "5 цагийн өмнө" },
  { id: 3, title: "A Business Proposal", cover: "https://picsum.photos/seed/business/300/420", genre: "Modern Romance", chapters: 128, status: "Completed", rating: 9.6, views: "1.8M", isHot: true, isNew: false, updated: "1 өдрийн өмнө" },
  { id: 4, title: "The Villainess Reverses the Hourglass", cover: "https://picsum.photos/seed/villainess/300/420", genre: "Isekai Romance", chapters: 112, status: "Ongoing", rating: 9.4, views: "980K", isHot: false, isNew: false, updated: "2 өдрийн өмнө" },
  { id: 5, title: "I Became the Tyrant's Secretary", cover: "https://picsum.photos/seed/tyrant/300/420", genre: "Historical Romance", chapters: 67, status: "Ongoing", rating: 9.2, views: "640K", isHot: false, isNew: true, updated: "3 цагийн өмнө" },
  { id: 6, title: "Beware of the Villainess", cover: "https://picsum.photos/seed/beware/300/420", genre: "Dark Romance", chapters: 95, status: "Completed", rating: 9.3, views: "720K", isHot: false, isNew: false, updated: "3 өдрийн өмнө" },
  { id: 7, title: "The Duchess Has a Deathwish", cover: "https://picsum.photos/seed/duchess/300/420", genre: "Dark Romance", chapters: 44, status: "Ongoing", rating: 9.1, views: "410K", isHot: false, isNew: true, updated: "6 цагийн өмнө" },
  { id: 8, title: "I'll Be the Matriarch in This Life", cover: "https://picsum.photos/seed/matriarch/300/420", genre: "Isekai Romance", chapters: 133, status: "Ongoing", rating: 9.0, views: "870K", isHot: true, isNew: false, updated: "1 өдрийн өмнө" },
  { id: 9, title: "The Emperor Wants to Divorce", cover: "https://picsum.photos/seed/emperor/300/420", genre: "Royal Romance", chapters: 78, status: "Ongoing", rating: 8.9, views: "530K", isHot: false, isNew: false, updated: "4 өдрийн өмнө" },
  { id: 10, title: "Office Romance at Midnight", cover: "https://picsum.photos/seed/office/300/420", genre: "Modern Romance", chapters: 52, status: "Ongoing", rating: 8.8, views: "390K", isHot: false, isNew: true, updated: "8 цагийн өмнө" },
  { id: 11, title: "The Maid and the Beast", cover: "https://picsum.photos/seed/maid/300/420", genre: "Fantasy Romance", chapters: 61, status: "Completed", rating: 9.0, views: "450K", isHot: false, isNew: false, updated: "5 өдрийн өмнө" },
  { id: 12, title: "Her Secret Bodyguard", cover: "https://picsum.photos/seed/bodyguard/300/420", genre: "Modern Romance", chapters: 88, status: "Ongoing", rating: 8.7, views: "310K", isHot: false, isNew: false, updated: "2 өдрийн өмнө" },
];

const GENRES = ["All", "Royal Romance", "Fantasy Romance", "Modern Romance", "Isekai Romance", "Historical Romance", "Dark Romance"];
const SORT_OPTIONS = [
  { value: "popular", label: "Их Үзэлттэй" },
  { value: "rating", label: "Өндөр Үнэлгээтэй" },
  { value: "newest", label: "Шинээр нэмэгдсэн" },
  { value: "chapters", label: "Олон бүлэгтэй" },
  { value: "updated", label: "Саяхан шинэчлэгдсэн" },
];
const STATUS_OPTIONS = ["Бүгд", "ГАРЧ БАЙГАА", "ДУУССАН"];

const css = `
  ${PLAYFAIR_MONTSERRAT_FONTS}
  ${baseCss}

  .manga-card { cursor: pointer; transition: transform 0.35s cubic-bezier(.22,.68,0,1.2), box-shadow 0.35s ease; }
  .manga-card:hover { transform: translateY(-7px); box-shadow: 0 22px 55px rgba(0,0,0,0.65), 0 0 0 1px rgba(201,168,76,0.25) !important; }
  .manga-card:hover .card-img { transform: scale(1.06); }
  .manga-card:hover .read-overlay { opacity: 1 !important; }
  .card-img { transition: transform 0.45s ease; }

  .genre-pill { cursor: pointer; border: none; transition: all 0.18s ease; }
  .genre-pill:hover { opacity: 0.85; }

  .filter-select { cursor: pointer; transition: border-color 0.2s; outline: none; }
  .filter-select:hover { border-color: rgba(201,168,76,0.4) !important; }
  .filter-select:focus { border-color: rgba(201,168,76,0.5) !important; }

  .view-btn { cursor: pointer; border: none; transition: all 0.15s; }
  .view-btn:hover { color: #c9a84c !important; }

  .list-row { cursor: pointer; transition: background 0.15s, border-left-color 0.15s; border-left: 2px solid transparent; }
  .list-row:hover { background: rgba(201,168,76,0.05) !important; border-left-color: rgba(201,168,76,0.35) !important; }
`;

export default function Browse() {
  const navigate = useNavigate();
  const screenWidth = useWindowSize();
  const isMobile = screenWidth < 768;

  const [activeGenre, setActiveGenre] = useState("All");
  const [activeStatus, setActiveStatus] = useState("Бүгд");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState("grid");
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

      <Header searchValue={search} onSearchChange={setSearch} />

      {/* ── PAGE HEADER ── */}
      <div style={{ padding: isMobile ? "28px 4% 20px" : "48px 3% 28px", maxWidth: MAX_W, margin: "0 auto" }}>
        <div style={{ marginBottom: 6, fontSize: 10, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase" }}>✦ Бүх цуврал</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 28 : 36, fontWeight: 700, color: "#e8e0d0", marginBottom: 8 }}>
          <span className="gold-shimmer">Бүх цуврал</span>
        </h1>
        <p style={{ fontSize: 13, fontWeight: 300, color: "rgba(232,224,208,0.45)" }}>
          {ALL_SERIES.length} цуврал · Өдөр бүр шинэчлэгддэг
        </p>
      </div>

      {/* ── FILTERS ── */}
      <div style={{ padding: isMobile ? "0 4% 20px" : "0 3% 28px", maxWidth: MAX_W, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {GENRES.map(g => (
            <button key={g} className="genre-pill" onClick={() => setActiveGenre(g)} style={{
              padding: isMobile ? "6px 12px" : "7px 16px", borderRadius: 4,
              fontSize: isMobile ? 10 : 11, fontFamily: "'Montserrat'",
              fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase",
              background: activeGenre === g ? "linear-gradient(135deg, #c9a84c, #8a6020)" : "rgba(255,255,255,0.04)",
              color: activeGenre === g ? "#080810" : "rgba(232,224,208,0.45)",
              border: activeGenre === g ? "none" : "1px solid rgba(255,255,255,0.08)",
              boxShadow: activeGenre === g ? "0 4px 14px rgba(201,168,76,0.3)" : "none",
            }}>{g}</button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 5 }}>
            {STATUS_OPTIONS.map(s => (
              <button key={s} className="genre-pill" onClick={() => setActiveStatus(s)} style={{
                padding: "6px 12px", borderRadius: 4,
                fontSize: isMobile ? 10 : 11, fontFamily: "'Montserrat'",
                fontWeight: 400, letterSpacing: "0.06em",
                background: activeStatus === s ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)",
                color: activeStatus === s ? "#c9a84c" : "rgba(232,224,208,0.35)",
                border: `1px solid ${activeStatus === s ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.06)"}`,
              }}>{s}</button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "7px 12px", fontSize: 12, color: "rgba(232,224,208,0.7)", fontFamily: "'Montserrat'", fontWeight: 300 }}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: "#12121e" }}>{o.label}</option>)}
          </select>
          {!isMobile && (
            <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, overflow: "hidden" }}>
              {[["grid", "⊞"], ["list", "☰"]].map(([mode, icon]) => (
                <button key={mode} className="view-btn" onClick={() => setViewMode(mode)} style={{ padding: "7px 12px", fontSize: 15, color: viewMode === mode ? "#c9a84c" : "rgba(232,224,208,0.3)", background: viewMode === mode ? "rgba(201,168,76,0.1)" : "transparent" }}>{icon}</button>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: "rgba(232,224,208,0.3)", fontWeight: 300 }}>
          {filtered.length} цуврал
          {activeGenre !== "All" && <span style={{ color: "#c9a84c" }}> · {activeGenre}</span>}
          {activeStatus !== "Бүгд" && <span style={{ color: "rgba(232,224,208,0.5)" }}> · {activeStatus}</span>}
          {search && <span style={{ color: "rgba(232,224,208,0.5)" }}> · "{search}"</span>}
        </div>
      </div>

      {/* ── SERIES ── */}
      <main style={{ maxWidth: MAX_W, margin: "0 auto", padding: isMobile ? "0 4% 60px" : "0 3% 80px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "rgba(232,224,208,0.5)", marginBottom: 8 }}>Цуврал олдсонгүй</h3>
            <p style={{ fontSize: 13, color: "rgba(232,224,208,0.3)", fontWeight: 300 }}>Өөр шүүлтүүр сонгоно уу</p>
          </div>
        ) : (isMobile || viewMode === "grid") ? (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 12 : 20 }}>
            {filtered.map((series, i) => (
              <div key={series.id} className="manga-card fade-up" style={{ animationDelay: `${i * 0.04}s`, background: "rgba(255,255,255,0.03)", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }} onClick={() => navigate(`/series/${series.id}`)}>
                <div style={{ position: "relative", paddingBottom: "145%", overflow: "hidden" }}>
                  <img className="card-img" src={series.cover} alt={series.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,16,0.9) 0%, rgba(8,8,16,0.2) 50%, transparent 75%)" }} />
                  <div style={{ position: "absolute", top: 8, left: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                    {series.isNew && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 2, background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>Шинэ</span>}
                    {series.isHot && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 2, background: "rgba(200,70,60,0.85)", color: "white", fontWeight: 500 }}>🔥 Hot</span>}
                  </div>
                  <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(8,8,16,0.75)", backdropFilter: "blur(8px)", borderRadius: 3, padding: "3px 7px", display: "flex", alignItems: "center", gap: 3, border: "1px solid rgba(201,168,76,0.2)" }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <span style={{ fontSize: 10, color: "#c9a84c", fontFamily: "'Montserrat'", fontWeight: 500 }}>{series.rating}</span>
                  </div>
                  <div className="read-overlay" style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px", opacity: 0, transition: "opacity 0.25s" }}>
                    <div style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "7px", borderRadius: 3, fontSize: 10, fontFamily: "'Montserrat'", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center" }}>Унших</div>
                  </div>
                </div>
                <div style={{ padding: "10px 10px 12px" }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 12 : 13, fontWeight: 500, color: "#e8e0d0", marginBottom: 4, lineHeight: 1.3 }}>{series.title}</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: "#c9a84c", fontFamily: "'Montserrat'", fontWeight: 300 }}>{series.genre}</span>
                    <span style={{ fontSize: 9, color: "rgba(232,224,208,0.3)" }}>{series.chapters} бүлэг</span>
                  </div>
                  <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 2, background: series.status === "Completed" ? "rgba(100,180,100,0.1)" : "rgba(201,168,76,0.1)", color: series.status === "Completed" ? "#80c480" : "#c9a84c", border: `1px solid ${series.status === "Completed" ? "rgba(100,180,100,0.2)" : "rgba(201,168,76,0.2)"}`, letterSpacing: "0.08em", textTransform: "uppercase" }}>{series.status === "Completed" ? "ДУУССАН" : "ГАРЧ БАЙГАА"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {filtered.map((series, i) => (
              <div key={series.id} className="list-row fade-up" style={{ animationDelay: `${i * 0.03}s`, display: "flex", gap: 16, alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }} onClick={() => navigate(`/series/${series.id}`)}>
                <span style={{ fontSize: 13, color: i < 3 ? "#c9a84c" : "rgba(232,224,208,0.2)", fontFamily: "'Playfair Display', serif", fontWeight: 700, minWidth: 24, textAlign: "center" }}>{i + 1}</span>
                <img src={series.cover} alt="" style={{ width: 44, height: 60, borderRadius: 4, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(201,168,76,0.1)" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 500, color: "#e8e0d0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{series.title}</h3>
                    {series.isNew && <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 2, background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", fontWeight: 500, textTransform: "uppercase", flexShrink: 0 }}>Шинэ</span>}
                    {series.isHot && <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 2, background: "rgba(200,70,60,0.8)", color: "white", fontWeight: 500, flexShrink: 0 }}>🔥</span>}
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, color: "#c9a84c", fontWeight: 300 }}>{series.genre}</span>
                    <span style={{ fontSize: 11, color: "rgba(232,224,208,0.35)", fontWeight: 300 }}>{series.chapters} бүлэг</span>
                    <span style={{ fontSize: 11, color: "rgba(232,224,208,0.35)", fontWeight: 300 }}>{series.updated}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <span style={{ fontSize: 13, color: "#c9a84c", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>{series.rating}</span>
                </div>
                <span style={{ fontSize: 9, padding: "3px 9px", borderRadius: 2, background: series.status === "Completed" ? "rgba(100,180,100,0.1)" : "rgba(201,168,76,0.1)", color: series.status === "Completed" ? "#80c480" : "#c9a84c", border: `1px solid ${series.status === "Completed" ? "rgba(100,180,100,0.2)" : "rgba(201,168,76,0.2)"}`, letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>{series.status === "Completed" ? "ДУУССАН" : "ГАРЧ БАЙГАА"}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}