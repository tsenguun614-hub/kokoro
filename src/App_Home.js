import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useWindowSize from "./useWindowSize";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { MAX_W, FONT_IMPORT, baseCss } from "./sharedStyles";
import { getFeaturedSeries, getRecentChapters, getTrendingSeries, getSiteStats, getAllSeries } from "./lib/series";
import { getGenres } from "./lib/genres";
import { timeAgo, isRecent, formatCount } from "./lib/format";

const TREND_PERIODS = [["day", "Өнөөдөр"], ["week", "7 хоног"], ["month", "1 сар"]];

// ── PAGE-SPECIFIC CSS ── (shared reset/keyframes/utility classes live in sharedStyles.baseCss)
const css = `
  ${FONT_IMPORT}
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

  const [featuredSeries, setFeaturedSeries] = useState([]);
  const [newChapters, setNewChapters] = useState([]);
  const [genres, setGenres] = useState(["All"]);
  const [activeGenre, setActiveGenre] = useState("All");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [trending, setTrending] = useState([]);
  const [trendingPeriod, setTrendingPeriod] = useState("week");
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [siteStats, setSiteStats] = useState({ seriesCount: 0, chapterCount: 0, todayCount: 0 });
  const [newSeriesList, setNewSeriesList] = useState([]);

  useEffect(() => {
    getFeaturedSeries().then(setFeaturedSeries).catch(() => setFeaturedSeries([]));
    getRecentChapters().then(setNewChapters).catch(() => setNewChapters([]));
    getGenres().then(gs => setGenres(["All", ...gs.map(g => g.name)])).catch(() => {});
    getSiteStats().then(setSiteStats).catch(() => {});
    getAllSeries({ sortBy: "newest" }).then(list => setNewSeriesList(list.slice(0, 5))).catch(() => setNewSeriesList([]));
  }, []);

  useEffect(() => {
    setTrendingLoading(true);
    getTrendingSeries(trendingPeriod, 5)
      .then(setTrending)
      .catch(() => setTrending([]))
      .finally(() => setTrendingLoading(false));
  }, [trendingPeriod]);

  const filtered = activeGenre === "All"
    ? featuredSeries
    : featuredSeries.filter(s => s.genres?.some(g => g.name === activeGenre));

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#f7f3ea", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", position: "relative", overflow: "hidden" }}>
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
              <span style={{ fontSize: 12, color: "#c9a84c", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 400 }}>Өнөөдөр 5 шинэ бүлэг</span>
            </div>

            <h1 className="fade-up fade-up-2" style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: isMobile ? 32 : 52, fontWeight: 700, lineHeight: 1.1, marginBottom: 8, color: "#f7f3ea" }}>
              Хайрын түүх
            </h1>
            <h1 className="fade-up fade-up-2" style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: isMobile ? 32 : 52, fontWeight: 700, lineHeight: 1.1, marginBottom: 24, fontStyle: "italic" }}>
              <span className="gold-shimmer">Эндээс эхэлнэ.</span>
            </h1>

            <p className="fade-up fade-up-3" style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: isMobile ? 15 : 17, fontWeight: 400, color: "rgba(247,243,234,0.7)", lineHeight: 1.7, marginBottom: 32 }}>
              Монгол хэлээр хамгийн шилдэг роман манхва уншаарай.<br />
              Шилмэл манхва. Анхааралтай орчуулсан.
            </p>

            <div className="fade-up fade-up-4" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="cta-btn" onClick={() => navigate("/browse")} style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: isMobile ? "11px 20px" : "13px 28px", borderRadius: 4, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", boxShadow: "0 8px 28px rgba(201,168,76,0.25)" }}>Уншиж эхлэх</button>
              <button className="ghost-btn" onClick={() => navigate("/browse")} style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c", padding: isMobile ? "11px 20px" : "13px 28px", borderRadius: 4, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase" }}>Бүгдийг үзэх</button>
            </div>

            <div className="fade-up fade-up-4" style={{ display: "flex", gap: 36, marginTop: 40 }}>
              {[[formatCount(siteStats.seriesCount), "Цуврал"], [formatCount(siteStats.chapterCount), "Бүлэг"], [formatCount(siteStats.todayCount), "Өнөөдөр нэмэгдсэн"]].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 24, fontWeight: 700, color: "#c9a84c" }}>{val}</div>
                  <div style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 12, fontWeight: 400, color: "rgba(247,243,234,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating covers — desktop only */}
          {!isMobile && featuredSeries.length >= 3 && (
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
                  <img src={featuredSeries[i].cover_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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

      {/* ── TRENDING ── */}
      {(trendingLoading || trending.length > 0) && (
        <section style={{ padding: isMobile ? "0 4% 40px" : "0 3% 48px", maxWidth: MAX_W, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>✦ Trending</div>
              <h2 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 24, fontWeight: 700, color: "#f7f3ea" }}>Хамгийн их хандалттай</h2>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {TREND_PERIODS.map(([val, label]) => (
                <button key={val} className="genre-btn" onClick={() => setTrendingPeriod(val)} style={{
                  padding: "6px 14px", borderRadius: 3, fontSize: 13,
                  fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 400, letterSpacing: "0.06em",
                  background: trendingPeriod === val ? "linear-gradient(135deg, #c9a84c, #8a6020)" : "rgba(255,255,255,0.04)",
                  color: trendingPeriod === val ? "#080810" : "rgba(247,243,234,0.45)",
                  border: trendingPeriod === val ? "none" : "1px solid rgba(255,255,255,0.08)",
                }}>{label}</button>
              ))}
            </div>
          </div>

          {trendingLoading && trending.length === 0 ? (
            <p style={{ fontSize: 14, color: "rgba(247,243,234,0.35)", fontWeight: 400 }}>Ачааллаж байна...</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)", gap: isMobile ? 12 : 16, opacity: trendingLoading ? 0.5 : 1, transition: "opacity 0.15s" }}>
              {trending.map((series, i) => (
                <div key={series.id} className="manga-card" onClick={() => navigate(`/series/${series.id}`)}
                  style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ position: "relative", paddingBottom: "140%", overflow: "hidden" }}>
                    <img className="card-img" src={series.cover_url} alt={series.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,16,0.9) 0%, rgba(8,8,16,0.3) 45%, transparent 70%)" }} />
                    <div style={{
                      position: "absolute", top: 8, left: 8, width: 22, height: 22, borderRadius: "50%",
                      background: i === 0 ? "linear-gradient(135deg, #c9a84c, #8a6020)" : "rgba(8,8,16,0.75)",
                      border: i === 0 ? "none" : "1px solid rgba(201,168,76,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif",
                      color: i === 0 ? "#080810" : "#c9a84c",
                    }}>{i + 1}</div>
                    <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(8,8,16,0.75)", backdropFilter: "blur(8px)", borderRadius: 3, padding: "3px 7px", display: "flex", alignItems: "center", gap: 3, border: "1px solid rgba(201,168,76,0.2)" }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      <span style={{ fontSize: 12, color: "#c9a84c", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500 }}>{series.rating}</span>
                    </div>
                  </div>
                  <div style={{ padding: "10px 10px 12px" }}>
                    <h3 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: isMobile ? 13 : 14, fontWeight: 700, color: "#f7f3ea", marginBottom: 4, lineHeight: 1.3 }}>{series.title}</h3>
                    <span style={{ fontSize: 11, color: "rgba(247,243,234,0.3)" }}>{series.chapterCount} бүлэг</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: MAX_W, margin: "0 auto", padding: isMobile ? "0 4% 60px" : "0 3% 60px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 300px", gap: isMobile ? 24 : 40 }}>

        {/* Left — Series grid */}
        <div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>✦ Шилмэл</div>
              <h2 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 24, fontWeight: 700, color: "#f7f3ea" }}>Онцлох цуврал</h2>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {genres.map(g => (
                <button key={g} className="genre-btn" onClick={() => setActiveGenre(g)} style={{
                  padding: "5px 12px", borderRadius: 3, fontSize: 13,
                  fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 400, letterSpacing: "0.08em",
                  background: activeGenre === g ? "linear-gradient(135deg, #c9a84c, #8a6020)" : "rgba(255,255,255,0.04)",
                  color: activeGenre === g ? "#080810" : "rgba(247,243,234,0.45)",
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
                  <img className="card-img" src={series.cover_url} alt={series.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: hoveredCard === series.id ? "scale(1.05)" : "scale(1)" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,16,0.9) 0%, rgba(8,8,16,0.3) 45%, transparent 70%)" }} />
                  {isRecent(series.created_at) && (
                    <div style={{ position: "absolute", top: 8, left: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", fontSize: 11, padding: "2px 7px", borderRadius: 2, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>Шинэ</span>
                    </div>
                  )}
                  <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(8,8,16,0.75)", backdropFilter: "blur(8px)", borderRadius: 3, padding: "3px 7px", display: "flex", alignItems: "center", gap: 3, border: "1px solid rgba(201,168,76,0.2)" }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <span style={{ fontSize: 12, color: "#c9a84c", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500 }}>{series.rating}</span>
                  </div>
                  <button className="overlay-btn" style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", border: "none", padding: "7px 16px", borderRadius: 3, fontSize: 12, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", opacity: 0, transition: "opacity 0.3s", letterSpacing: "0.08em", textTransform: "uppercase" }}>Унших</button>
                </div>
                <div style={{ padding: "12px 12px 14px" }}>
                  <h3 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: isMobile ? 13 : 15, fontWeight: 700, color: "#f7f3ea", marginBottom: 5, lineHeight: 1.3 }}>{series.title}</h3>
                  <div style={{ marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: "rgba(247,243,234,0.3)", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif" }}>{series.chapterCount} бүлэг</span>
                  </div>
                  <span style={{
                    fontSize: 11, padding: "2px 7px", borderRadius: 2,
                    background: series.status === "Completed" ? "rgba(100,180,100,0.1)" : "rgba(201,168,76,0.1)",
                    color: series.status === "Completed" ? "#80c480" : "#c9a84c",
                    fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase",
                    border: `1px solid ${series.status === "Completed" ? "rgba(100,180,100,0.2)" : "rgba(201,168,76,0.2)"}`,
                  }}>{series.status === "Completed" ? "ДУУССАН" : "ГАРЧ БАЙГАА"}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 28 }}>
            <button onClick={() => navigate("/browse")} className="ghost-btn" style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.25)", color: "#c9a84c", padding: "11px 28px", borderRadius: 4, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase" }}>Бүх цувралыг үзэх →</button>
          </div>
        </div>

        {/* Right Sidebar — desktop only */}
        {!isMobile && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "20px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
                <h3 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 16, fontWeight: 700, color: "#f7f3ea" }}>Шинээр Нэмэгдсэн</h3>
                <span onClick={() => navigate("/browse")} style={{ fontSize: 12, color: "#c9a84c", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>Бүгд →</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {newChapters.map((ch) => (
                  <div key={ch.id} className="chapter-row" onClick={() => navigate(`/series/${ch.series.id}`)} style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 6px" }}>
                    <img src={ch.series.cover_url} alt="" style={{ width: 38, height: 52, borderRadius: 4, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(201,168,76,0.1)" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 13, fontWeight: 700, color: "#f7f3ea", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.series.title}</div>
                      <div style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 12, color: "#c9a84c", marginTop: 2, fontWeight: 400 }}>Ch. {ch.chapter_number}</div>
                      <div style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 12, color: "rgba(247,243,234,0.3)", marginTop: 1 }}>{timeAgo(ch.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "20px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
                <h3 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 16, fontWeight: 700, color: "#f7f3ea" }}>Шинэ Цувралууд</h3>
                <span onClick={() => navigate("/browse")} style={{ fontSize: 12, color: "#c9a84c", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>Бүгд →</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {newSeriesList.map((s) => (
                  <div key={s.id} className="chapter-row" onClick={() => navigate(`/series/${s.id}`)} style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 6px" }}>
                    <img src={s.cover_url} alt="" style={{ width: 38, height: 52, borderRadius: 4, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(201,168,76,0.1)" }} />
                    <div style={{ flex: 1, minWidth: 0, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 13, fontWeight: 700, color: "#f7f3ea", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}