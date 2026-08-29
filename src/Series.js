import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useWindowSize from "./useWindowSize";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { MAX_W, PLAYFAIR_MONTSERRAT_FONTS, baseCss } from "./sharedStyles";

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
    { id: 156, title: "When Empires Fall", date: "2 цагийн өмнө", isNew: true },
    { id: 155, title: "A Shattered Vow", date: "7 өдрийн өмнө", isNew: false },
    { id: 154, title: "The Weight of a Crown", date: "14 өдрийн өмнө", isNew: false },
    { id: 153, title: "Shadows in the Court", date: "21 өдрийн өмнө", isNew: false },
    { id: 152, title: "The Emperor's Mistake", date: "28 өдрийн өмнө", isNew: false },
    { id: 151, title: "A Queen's Silence", date: "35 өдрийн өмнө", isNew: false },
    { id: 150, title: "When the Rose Blooms", date: "42 өдрийн өмнө", isNew: false },
    { id: 149, title: "The Northern King", date: "49 өдрийн өмнө", isNew: false },
    { id: 148, title: "Letters Never Sent", date: "56 өдрийн өмнө", isNew: false },
    { id: 147, title: "Coronation", date: "63 өдрийн өмнө", isNew: false },
    { id: 146, title: "The Price of Pride", date: "70 өдрийн өмнө", isNew: false },
    { id: 145, title: "Unspoken Words", date: "77 өдрийн өмнө", isNew: false },
  ],
  related: [
    { id: 2, title: "The Villainess Reverses the Hourglass", cover: "https://picsum.photos/seed/villainess/300/420", genre: "Isekai Romance", rating: 9.4 },
    { id: 3, title: "I Became the Tyrant's Secretary", cover: "https://picsum.photos/seed/tyrant/300/420", genre: "Historical Romance", rating: 9.2 },
    { id: 4, title: "My Husband Hides His Beauty", cover: "https://picsum.photos/seed/husband/300/420", genre: "Fantasy Romance", rating: 9.5 },
  ],
};

const css = `
  ${PLAYFAIR_MONTSERRAT_FONTS}
  ${baseCss}

  .chapter-row { cursor: pointer; transition: background 0.15s, border-color 0.15s; border-left: 2px solid transparent; }
  .chapter-row:hover { background: rgba(201,168,76,0.06) !important; border-left-color: rgba(201,168,76,0.4) !important; }

  .related-card { cursor: pointer; transition: transform 0.3s cubic-bezier(.22,.68,0,1.2), box-shadow 0.3s ease; }
  .related-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(0,0,0,0.6) !important; }
  .related-card:hover .related-img { transform: scale(1.05); }
  .related-img { transition: transform 0.4s ease; }

  .tab-btn { cursor: pointer; border: none; transition: all 0.2s; }
  .tab-btn:hover { color: #e8e0d0 !important; }
`;

export default function SeriesDetail() {
  const navigate = useNavigate();
  const screenWidth = useWindowSize();
  const isMobile = screenWidth < 768;

  const [bookmarked, setBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState("chapters");
  const [showAll, setShowAll] = useState(false);
  const [sortDesc, setSortDesc] = useState(true);

  const displayed = showAll ? SERIES.chapters : SERIES.chapters.slice(0, 6);
  const sorted = sortDesc ? displayed : [...displayed].reverse();

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#e8e0d0", fontFamily: "'Montserrat', sans-serif" }}>
      <style>{css}</style>

      <Header />

      {/* ── BANNER ── */}
      <div style={{ position: "relative", height: isMobile ? 180 : 280, overflow: "hidden" }}>
        <img src={SERIES.banner} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.35)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,8,16,0.2) 0%, rgba(8,8,16,0.95) 100%)" }} />
      </div>

      {/* ── SERIES INFO ── */}
      <div style={{ maxWidth: MAX_W, margin: "0 auto", padding: isMobile ? "0 4%" : "0 3%" }}>

        {/* Cover + Info */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "220px 1fr",
          gap: isMobile ? 20 : 36,
          marginTop: isMobile ? -60 : -120,
          position: "relative", zIndex: 10,
          marginBottom: 40,
        }}>
          {/* Cover */}
          <div className="fade-up fade-up-1">
            <div style={{ borderRadius: 10, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.2)", maxWidth: isMobile ? 140 : "100%" }}>
              <img src={SERIES.cover} alt={SERIES.title} style={{ width: "100%", display: "block" }} />
            </div>
            {!isMobile && (
              <>
                <button className="cta-btn" onClick={() => navigate("/read/empress/156")} style={{ width: "100%", marginTop: 14, background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "13px", borderRadius: 6, fontSize: 13, fontFamily: "'Montserrat'", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: "0 8px 24px rgba(201,168,76,0.3)" }}>▶ Уншиж эхлэх</button>
                <button className="ghost-btn" onClick={() => setBookmarked(!bookmarked)} style={{ width: "100%", marginTop: 8, background: bookmarked ? "rgba(201,168,76,0.1)" : "transparent", border: `1px solid ${bookmarked ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.1)"}`, color: bookmarked ? "#c9a84c" : "rgba(232,224,208,0.5)", padding: "11px", borderRadius: 6, fontSize: 13, fontFamily: "'Montserrat'", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {bookmarked ? "✦ Хадгалсан" : "☆ Хадгалах"}
                </button>
              </>
            )}
          </div>

          {/* Info */}
          <div style={{ paddingTop: isMobile ? 0 : 100 }}>
            <div className="fade-up fade-up-1" style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              {SERIES.genre.map(g => (
                <span key={g} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 3, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "#c9a84c", fontFamily: "'Montserrat'", letterSpacing: "0.1em", textTransform: "uppercase" }}>{g}</span>
              ))}
              <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 3, background: "rgba(100,180,100,0.1)", border: "1px solid rgba(100,180,100,0.2)", color: "#80c480", fontFamily: "'Montserrat'", letterSpacing: "0.1em", textTransform: "uppercase" }}>{SERIES.status}</span>
            </div>

            <h1 className="fade-up fade-up-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 24 : 38, fontWeight: 700, lineHeight: 1.2, marginBottom: 14, color: "#e8e0d0" }}>
              {SERIES.title}
            </h1>

            <div className="fade-up fade-up-2" style={{ display: "flex", gap: isMobile ? 16 : 28, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#c9a84c" }}>{SERIES.rating}</span>
                <span style={{ fontSize: 11, color: "rgba(232,224,208,0.4)", fontWeight: 300 }}>/ 10</span>
              </div>
              {[["👁", SERIES.views, "Үзэлт"], ["🔖", SERIES.bookmarks, "Хадгалсан"], ["📖", `${SERIES.chapters.length}`, "Бүлэг"]].map(([icon, val, label]) => (
                <div key={label} style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#e8e0d0" }}>{icon} {val}</span>
                  <span style={{ fontSize: 10, color: "rgba(232,224,208,0.35)", fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
                </div>
              ))}
            </div>

            {isMobile && (
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <button className="cta-btn" onClick={() => navigate("/read/empress/156")} style={{ flex: 1, background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "11px", borderRadius: 6, fontSize: 12, fontFamily: "'Montserrat'", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>▶ Унших</button>
                <button className="ghost-btn" onClick={() => setBookmarked(!bookmarked)} style={{ flex: 1, background: bookmarked ? "rgba(201,168,76,0.1)" : "transparent", border: `1px solid ${bookmarked ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.15)"}`, color: bookmarked ? "#c9a84c" : "rgba(232,224,208,0.5)", padding: "11px", borderRadius: 6, fontSize: 12, fontFamily: "'Montserrat'", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {bookmarked ? "✦ Хадгалсан" : "☆ Хадгалах"}
                </button>
              </div>
            )}

            <div className="fade-up fade-up-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "16px", marginBottom: 16 }}>
              <p style={{ fontSize: isMobile ? 13 : 14, fontWeight: 300, lineHeight: 1.85, color: "rgba(232,224,208,0.75)", whiteSpace: "pre-line" }}>{SERIES.description}</p>
            </div>

            <div className="fade-up fade-up-3" style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[["Зохиолч", SERIES.author], ["Зураач", SERIES.artist], ["Гарсан он", SERIES.released]].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 10, color: "rgba(232,224,208,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3, fontWeight: 300 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#c9a84c", fontWeight: 400 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 24, display: "flex" }}>
          {[["chapters", "Бүлгүүд"], ["details", "Дэлгэрэнгүй"]].map(([val, label]) => (
            <button key={val} className="tab-btn" onClick={() => setActiveTab(val)} style={{
              padding: "12px 24px", fontSize: 13,
              fontFamily: "'Montserrat'", fontWeight: activeTab === val ? 500 : 300,
              color: activeTab === val ? "#c9a84c" : "rgba(232,224,208,0.4)",
              background: "none", letterSpacing: "0.08em", textTransform: "uppercase",
              borderBottom: activeTab === val ? "2px solid #c9a84c" : "2px solid transparent",
              marginBottom: -1,
            }}>{label}</button>
          ))}
        </div>

        {activeTab === "chapters" && (
          <div style={{ marginBottom: 60 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: "rgba(232,224,208,0.4)", fontWeight: 300 }}>{SERIES.chapters.length} бүлэг нийт</span>
              <button onClick={() => setSortDesc(!sortDesc)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "6px 14px", fontSize: 11, color: "rgba(232,224,208,0.5)", fontFamily: "'Montserrat'", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {sortDesc ? "↓ Шинэ эхэндээ" : "↑ Хуучин эхэндээ"}
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {sorted.map((ch) => (
                <div key={ch.id} className="chapter-row" onClick={() => navigate(`/read/empress/${ch.id}`)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "12px 12px" : "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", borderLeft: "2px solid transparent" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 14 }}>
                    <span style={{ fontSize: 12, color: "#c9a84c", fontFamily: "'Montserrat'", fontWeight: 500, minWidth: 44 }}>Ch. {ch.id}</span>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 13 : 14, color: "#e8e0d0" }}>{ch.title}</span>
                    {ch.isNew && <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 3, background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>Шинэ</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {!isMobile && <span style={{ fontSize: 11, color: "rgba(232,224,208,0.3)", fontWeight: 300 }}>{ch.date}</span>}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                </div>
              ))}
            </div>

            {!showAll && SERIES.chapters.length > 6 && (
              <button onClick={() => setShowAll(true)} className="ghost-btn" style={{ width: "100%", marginTop: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "12px", fontSize: 12, color: "rgba(232,224,208,0.4)", fontFamily: "'Montserrat'", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Бүгдийг харах ({SERIES.chapters.length} бүлэг) ↓
              </button>
            )}
          </div>
        )}

        {activeTab === "details" && (
          <div style={{ marginBottom: 60 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, maxWidth: 600 }}>
              {[
                ["Гарчиг", SERIES.title],
                ["Зохиолч", SERIES.author],
                ["Зураач", SERIES.artist],
                ["Төлөв", SERIES.status],
                ["Гарсан он", SERIES.released],
                ["Нийт бүлэг", SERIES.chapters.length],
                ["Үзэлт", SERIES.views],
                ["Хадгалсан", SERIES.bookmarks],
              ].map(([label, val]) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 10, color: "rgba(232,224,208,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5, fontWeight: 300 }}>{label}</div>
                  <div style={{ fontSize: 14, color: "#e8e0d0", fontWeight: 400 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RELATED ── */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>✦ Танд таалагдаж болох</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "#e8e0d0" }}>Төстэй цуврал</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: isMobile ? 12 : 20 }}>
            {SERIES.related.map(s => (
              <div key={s.id} className="related-card" onClick={() => navigate(`/series/${s.id}`)} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                <div style={{ position: "relative", paddingBottom: "140%", overflow: "hidden" }}>
                  <img className="related-img" src={s.cover} alt={s.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,16,0.8) 0%, transparent 60%)" }} />
                  <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(8,8,16,0.7)", backdropFilter: "blur(8px)", borderRadius: 3, padding: "3px 7px", display: "flex", alignItems: "center", gap: 3, border: "1px solid rgba(201,168,76,0.2)" }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <span style={{ fontSize: 10, color: "#c9a84c", fontFamily: "'Montserrat'", fontWeight: 500 }}>{s.rating}</span>
                  </div>
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 12 : 14, fontWeight: 500, color: "#e8e0d0", marginBottom: 4, lineHeight: 1.3 }}>{s.title}</h3>
                  <span style={{ fontSize: 10, color: "#c9a84c", fontFamily: "'Montserrat'", fontWeight: 300 }}>{s.genre}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}