import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useWindowSize from "./useWindowSize";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { MAX_W, PLAYFAIR_MONTSERRAT_FONTS, baseCss } from "./sharedStyles";

// ── DATA ──
const featuredSeries = [
  { id: 1, title: "The Remarried Empress", cover: "https://picsum.photos/seed/empress/300/420", genre: "Royal Romance", chapters: 156, status: "Ongoing", rating: 9.8, isNew: false, isHot: true },
  { id: 2, title: "My Husband Hides His Beauty", cover: "https://picsum.photos/seed/husband/300/420", genre: "Fantasy Romance", chapters: 89, status: "Ongoing", rating: 9.5, isNew: true, isHot: false },
  { id: 3, title: "A Business Proposal", cover: "https://picsum.photos/seed/business/300/420", genre: "Modern Romance", chapters: 128, status: "Completed", rating: 9.6, isNew: false, isHot: true },
  { id: 4, title: "The Villainess Reverses the Hourglass", cover: "https://picsum.photos/seed/villainess/300/420", genre: "Isekai Romance", chapters: 112, status: "Ongoing", rating: 9.4, isNew: false, isHot: false },
  { id: 5, title: "I Became the Tyrant's Secretary", cover: "https://picsum.photos/seed/tyrant/300/420", genre: "Historical Romance", chapters: 67, status: "Ongoing", rating: 9.2, isNew: true, isHot: false },
  { id: 6, title: "Beware of the Villainess", cover: "https://picsum.photos/seed/beware/300/420", genre: "Dark Romance", chapters: 95, status: "Completed", rating: 9.3, isNew: false, isHot: false },
];

const newChapters = [
  { id: 1, title: "The Remarried Empress", chapter: "Ch. 156", time: "2 цагийн өмнө", cover: "https://picsum.photos/seed/empress/60/80" },
  { id: 2, title: "My Husband Hides His Beauty", chapter: "Ch. 89", time: "5 цагийн өмнө", cover: "https://picsum.photos/seed/husband/60/80" },
  { id: 5, title: "I Became the Tyrant's Secretary", chapter: "Ch. 67", time: "8 цагийн өмнө", cover: "https://picsum.photos/seed/tyrant/60/80" },
  { id: 4, title: "The Villainess Reverses", chapter: "Ch. 112", time: "1 өдрийн өмнө", cover: "https://picsum.photos/seed/villainess/60/80" },
  { id: 6, title: "Beware of the Villainess", chapter: "Ch. 95", time: "1 өдрийн өмнө", cover: "https://picsum.photos/seed/beware/60/80" },
];

const genres = ["All", "Royal Romance", "Fantasy", "Modern", "Isekai", "Historical", "Dark Romance"];

// ── PAGE-SPECIFIC CSS ── (shared reset/keyframes/utility classes live in sharedStyles.baseCss)
const css = `
  ${PLAYFAIR_MONTSERRAT_FONTS}
  ${baseCss}

  .manga-card { transition: transform 0.35s cubic-bezier(.22,.68,0,1.2), box-shadow 0.35s ease; cursor: pointer; }
  .manga-card:hover { transform: translateY(-7px); box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.25) !important; }
  .manga-card:hover .card-img { transform: scale(1.05); }
  .manga-card:hover .overlay-btn { opacity: 1 !important; }
  .card-img { transition: transform 0.4s ease; }

  .genre-btn { transition: all 0.2s ease; cursor: pointer; border: none; }
  .genre-btn:hover { opacity: 0.8; }

  .chapter-row { transition: background 0.2s; cursor: pointer; border-radius: 8px; }
  .chapter-row:hover { background: rgba(201,168,76,0.07) !important; }

  .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
`;

export default function Home() {
  const navigate = useNavigate();
  const screenWidth = useWindowSize();
  const isMobile = screenWidth < 768;

  const [activeGenre, setActiveGenre] = useState("All");
  const [hoveredCard, setHoveredCard] = useState(null);

  const filtered = activeGenre === "All"
    ? featuredSeries
    : featuredSeries.filter(s => s.genre.toLowerCase().includes(activeGenre.toLowerCase()));

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#e8e0d0", fontFamily: "'Montserrat', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{css}</style>

      {/* Ambient orbs */}
      <div className="orb" style={{ width: 600, height: 600, background: "rgba(100,60,160,0.12)", top: -200, right: -100 }} />
      <div className="orb" style={{ width: 400, height: 400, background: "rgba(201,168,76,0.06)", top: 300, left: -150 }} />
      <div className="orb" style={{ width: 300, height: 300, background: "rgba(160,60,80,0.08)", bottom: 200, right: 100 }} />

      <Header />

      {/* ── HERO ── */}
      <section style={{ padding: isMobile ? "24px 4% 20px" : "60px 3% 40px", maxWidth: MAX_W, margin: "0 auto" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(100,60,160,0.1) 50%, rgba(160,60,80,0.08) 100%)",
          borderRadius: 24, padding: isMobile ? "32px 24px" : "50px 60px",
          display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 280px",
          gap: isMobile ? 24 : 60, alignItems: "center",
          position: "relative", overflow: "hidden",
          border: "1px solid rgba(201,168,76,0.12)",
        }}>
          <div style={{ position: "absolute", top: -40, right: 200, width: 200, height: 200, borderRadius: "50%", background: "rgba(201,168,76,0.06)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, right: 80, width: 280, height: 280, borderRadius: "50%", background: "rgba(100,60,160,0.06)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="fade-up fade-up-1" style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid rgba(201,168,76,0.3)", borderRadius: 3, padding: "5px 14px", marginBottom: 20 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#c9a84c", display: "inline-block" }} />
              <span style={{ fontSize: 10, color: "#c9a84c", fontFamily: "'Montserrat'", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 400 }}>Өнөөдөр 5 шинэ бүлэг</span>
            </div>

            <h1 className="fade-up fade-up-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 32 : 52, fontWeight: 700, lineHeight: 1.1, marginBottom: 8, color: "#e8e0d0" }}>
              Хайрын түүх
            </h1>
            <h1 className="fade-up fade-up-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 32 : 52, fontWeight: 700, lineHeight: 1.1, marginBottom: 24, fontStyle: "italic" }}>
              <span className="gold-shimmer">Эндээс эхэлнэ.</span>
            </h1>

            <p className="fade-up fade-up-3" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: isMobile ? 13 : 15, fontWeight: 300, color: "rgba(232,224,208,0.6)", lineHeight: 1.8, marginBottom: 32 }}>
              Монгол хэлээр хамгийн шилдэг роман манхва уншаарай.<br />
              Шилмэл манхва. Анхааралтай орчуулсан.
            </p>

            <div className="fade-up fade-up-4" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="cta-btn" onClick={() => navigate("/browse")} style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: isMobile ? "11px 20px" : "13px 28px", borderRadius: 4, fontSize: 12, fontFamily: "'Montserrat'", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", boxShadow: "0 8px 28px rgba(201,168,76,0.25)" }}>Уншиж эхлэх</button>
              <button className="ghost-btn" onClick={() => navigate("/browse")} style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c", padding: isMobile ? "11px 20px" : "13px 28px", borderRadius: 4, fontSize: 12, fontFamily: "'Montserrat'", fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase" }}>Бүгдийг үзэх</button>
            </div>

            <div className="fade-up fade-up-4" style={{ display: "flex", gap: 36, marginTop: 40 }}>
              {[["48", "Цуврал"], ["3.2K", "Бүлэг"], ["12K+", "Уншигч"]].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#c9a84c" }}>{val}</div>
                  <div style={{ fontFamily: "'Montserrat'", fontSize: 10, fontWeight: 300, color: "rgba(232,224,208,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating covers — desktop only */}
          {!isMobile && (
            <div style={{ position: "relative", height: 220 }}>
              {[2, 1, 0].map((i) => (
                <div key={i} onClick={() => navigate(`/series/${featuredSeries[i].id}`)} style={{
                  position: "absolute", width: 120, height: 170, borderRadius: 12, overflow: "hidden",
                  boxShadow: "0 12px 36px rgba(0,0,0,0.6)",
                  left: i === 0 ? 70 : i === 1 ? 35 : 0,
                  top: i === 0 ? 20 : i === 1 ? 10 : 0,
                  transform: `rotate(${i === 0 ? 6 : i === 1 ? 2 : -4}deg)`,
                  border: "1px solid rgba(201,168,76,0.15)", zIndex: i, cursor: "pointer",
                  "--r": `${i === 0 ? 6 : i === 1 ? 2 : -4}deg`,
                  animation: `float ${3.5 + i * 0.7}s ease-in-out infinite`,
                  animationDelay: `${i * 0.4}s`,
                }}>
                  <img src={featuredSeries[i].cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,16,0.5) 0%, transparent 60%)" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: MAX_W, margin: "0 auto 40px", padding: "0 3%" }}>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)" }} />
      </div>

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: MAX_W, margin: "0 auto", padding: isMobile ? "0 4% 60px" : "0 3% 60px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 300px", gap: isMobile ? 24 : 40 }}>

        {/* Left — Series grid */}
        <div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>✦ Шилмэл</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#e8e0d0" }}>Онцлох цуврал</h2>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {genres.map(g => (
                <button key={g} className="genre-btn" onClick={() => setActiveGenre(g)} style={{
                  padding: "5px 12px", borderRadius: 3, fontSize: 11,
                  fontFamily: "'Montserrat'", fontWeight: 400, letterSpacing: "0.08em",
                  background: activeGenre === g ? "linear-gradient(135deg, #c9a84c, #8a6020)" : "rgba(255,255,255,0.04)",
                  color: activeGenre === g ? "#080810" : "rgba(232,224,208,0.45)",
                  border: activeGenre === g ? "none" : "1px solid rgba(255,255,255,0.08)",
                  textTransform: "uppercase",
                }}>{g}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: isMobile ? 12 : 20 }}>
            {filtered.map((series) => (
              <div key={series.id} className="manga-card"
                onMouseEnter={() => setHoveredCard(series.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => navigate(`/series/${series.id}`)}
                style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ position: "relative", paddingBottom: "140%", overflow: "hidden" }}>
                  <img className="card-img" src={series.cover} alt={series.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: hoveredCard === series.id ? "scale(1.05)" : "scale(1)" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,16,0.9) 0%, rgba(8,8,16,0.3) 45%, transparent 70%)" }} />
                  <div style={{ position: "absolute", top: 8, left: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                    {series.isNew && <span style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", fontSize: 9, padding: "2px 7px", borderRadius: 2, fontFamily: "'Montserrat'", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>Шинэ</span>}
                    {series.isHot && <span style={{ background: "rgba(200,70,60,0.85)", color: "white", fontSize: 9, padding: "2px 7px", borderRadius: 2, fontFamily: "'Montserrat'", fontWeight: 500 }}>🔥 Hot</span>}
                  </div>
                  <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(8,8,16,0.75)", backdropFilter: "blur(8px)", borderRadius: 3, padding: "3px 7px", display: "flex", alignItems: "center", gap: 3, border: "1px solid rgba(201,168,76,0.2)" }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <span style={{ fontSize: 10, color: "#c9a84c", fontFamily: "'Montserrat'", fontWeight: 500 }}>{series.rating}</span>
                  </div>
                  <button className="overlay-btn" style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", border: "none", padding: "7px 16px", borderRadius: 3, fontSize: 10, fontFamily: "'Montserrat'", fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", opacity: 0, transition: "opacity 0.3s", letterSpacing: "0.08em", textTransform: "uppercase" }}>Унших</button>
                </div>
                <div style={{ padding: "12px 12px 14px" }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 12 : 14, fontWeight: 500, color: "#e8e0d0", marginBottom: 5, lineHeight: 1.3 }}>{series.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: "#c9a84c", fontFamily: "'Montserrat'", fontWeight: 300 }}>{series.genre}</span>
                    <span style={{ fontSize: 9, color: "rgba(232,224,208,0.3)", fontFamily: "'Montserrat'" }}>{series.chapters} бүлэг</span>
                  </div>
                  <span style={{
                    fontSize: 9, padding: "2px 7px", borderRadius: 2,
                    background: series.status === "Completed" ? "rgba(100,180,100,0.1)" : "rgba(201,168,76,0.1)",
                    color: series.status === "Completed" ? "#80c480" : "#c9a84c",
                    fontFamily: "'Montserrat'", letterSpacing: "0.08em", textTransform: "uppercase",
                    border: `1px solid ${series.status === "Completed" ? "rgba(100,180,100,0.2)" : "rgba(201,168,76,0.2)"}`,
                  }}>{series.status === "Completed" ? "ДУУССАН" : "ГАРЧ БАЙГАА"}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 28 }}>
            <button onClick={() => navigate("/browse")} className="ghost-btn" style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.25)", color: "#c9a84c", padding: "11px 28px", borderRadius: 4, fontSize: 12, fontFamily: "'Montserrat'", fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase" }}>Бүх цувралыг үзэх →</button>
          </div>
        </div>

        {/* Right Sidebar — desktop only */}
        {!isMobile && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "20px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: "#e8e0d0" }}>Шинээр Нэмэгдсэн</h3>
                <span onClick={() => navigate("/browse")} style={{ fontSize: 10, color: "#c9a84c", fontFamily: "'Montserrat'", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>Бүгд →</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {newChapters.map((ch, i) => (
                  <div key={i} className="chapter-row" onClick={() => navigate(`/series/${ch.id}`)} style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 6px" }}>
                    <img src={ch.cover} alt="" style={{ width: 38, height: 52, borderRadius: 4, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(201,168,76,0.1)" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 12, fontWeight: 500, color: "#e8e0d0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.title}</div>
                      <div style={{ fontFamily: "'Montserrat'", fontSize: 10, color: "#c9a84c", marginTop: 2, fontWeight: 300 }}>{ch.chapter}</div>
                      <div style={{ fontFamily: "'Montserrat'", fontSize: 10, color: "rgba(232,224,208,0.3)", marginTop: 1 }}>{ch.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(100,60,160,0.08))", borderRadius: 8, padding: "20px", border: "1px solid rgba(201,168,76,0.15)" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: "#e8e0d0", marginBottom: 14 }}>Нийт Сан</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["48", "Цуврал"], ["3.2K", "Бүлэг"], ["12K", "Уншигч"], ["Өдөр бүр", "Шинэчлэл"]].map(([val, label]) => (
                  <div key={label} style={{ background: "rgba(8,8,16,0.4)", borderRadius: 8, padding: "10px", textAlign: "center", border: "1px solid rgba(201,168,76,0.1)" }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#c9a84c" }}>{val}</div>
                    <div style={{ fontFamily: "'Montserrat'", fontSize: 10, color: "rgba(232,224,208,0.4)", fontWeight: 300 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "20px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: "#e8e0d0", marginBottom: 14 }}>Төрлөөр үзэх</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {["Royal Romance", "Fantasy Romance", "Modern Romance", "Isekai Romance", "Historical Romance", "Dark Romance"].map(g => (
                  <div key={g} onClick={() => navigate("/browse")} className="chapter-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 10px" }}>
                    <span style={{ fontSize: 13, color: "rgba(232,224,208,0.6)", fontWeight: 300 }}>{g}</span>
                    <span style={{ fontSize: 11, color: "#c9a84c" }}>→</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "20px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: 22, marginBottom: 8, textAlign: "center" }}>✦</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: "#e8e0d0", textAlign: "center", marginBottom: 8 }}>Бүлгийг бүү алдаарай</h3>
              <p style={{ fontFamily: "'Montserrat'", fontSize: 12, color: "rgba(232,224,208,0.4)", textAlign: "center", marginBottom: 14, lineHeight: 1.5, fontWeight: 300 }}>Дуртай цувралынхаа шинэ бүлэг гарахад мэдэгдэл авах</p>
              <input placeholder="И-мэйл хаяг" style={{ width: "100%", padding: "9px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 4, outline: "none", fontFamily: "'Montserrat'", fontSize: 12, color: "#e8e0d0", marginBottom: 8, fontWeight: 300 }} />
              <button onClick={() => navigate("/auth")} style={{ width: "100%", background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "9px", borderRadius: 4, fontSize: 11, fontFamily: "'Montserrat'", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>Бүртгүүлэх ✦</button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}