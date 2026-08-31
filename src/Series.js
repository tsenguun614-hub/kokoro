import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useWindowSize from "./useWindowSize";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { MAX_W, FONT_IMPORT, baseCss } from "./sharedStyles";
import { getSeriesById, getChaptersForSeries, getRelatedSeries, logSeriesView } from "./lib/series";
import { addBookmark, removeBookmark, isBookmarked, getBookmarkCount } from "./lib/bookmarks";
import { timeAgo, isRecent } from "./lib/format";
import useAuth from "./lib/useAuth";

const css = `
  ${FONT_IMPORT}
  ${baseCss}

  .chapter-row { cursor: pointer; transition: background 0.15s, border-color 0.15s; border-left: 2px solid transparent; }
  .chapter-row:hover { background: rgba(201,168,76,0.06) !important; border-left-color: rgba(201,168,76,0.4) !important; }

  .related-card { cursor: pointer; transition: transform 0.3s cubic-bezier(.22,.68,0,1.2), box-shadow 0.3s ease; }
  .related-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(0,0,0,0.6) !important; }
  .related-card:hover .related-img { transform: scale(1.05); }
  .related-img { transition: transform 0.4s ease; }

  .tab-btn { cursor: pointer; border: none; transition: all 0.2s; }
  .tab-btn:hover { color: #f7f3ea !important; }
`;

export default function SeriesDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const screenWidth = useWindowSize();
  const isMobile = screenWidth < 768;
  const { user } = useAuth();

  const [series, setSeries] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [related, setRelated] = useState([]);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState("chapters");
  const [showAll, setShowAll] = useState(false);
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getSeriesById(id)
      .then(async (s) => {
        setSeries(s);
        logSeriesView(s.id);
        const genreIds = (s.genres || []).map((g) => g.id);
        const [ch, rel, count] = await Promise.all([
          getChaptersForSeries(s.id),
          getRelatedSeries(genreIds, s.id),
          getBookmarkCount(s.id),
        ]);
        setChapters(ch);
        setRelated(rel);
        setBookmarkCount(count);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user || !series) { setBookmarked(false); return; }
    isBookmarked(user.id, series.id).then(setBookmarked).catch(() => setBookmarked(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, series]);

  const toggleBookmark = async () => {
    if (!user) { navigate("/auth"); return; }
    if (bookmarked) {
      await removeBookmark(user.id, series.id);
      setBookmarked(false);
      setBookmarkCount((c) => Math.max(0, c - 1));
    } else {
      await addBookmark(user.id, series.id);
      setBookmarked(true);
      setBookmarkCount((c) => c + 1);
    }
  };

  const displayed = showAll ? chapters : chapters.slice(0, 6);
  const sorted = sortDesc ? displayed : [...displayed].reverse();
  const latestChapter = chapters[0];

  if (loading) {
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

  if (error || !series) {
    return (
      <div style={{ minHeight: "100vh", background: "#080810", color: "#f7f3ea", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif" }}>
        <style>{css}</style>
        <Header />
        <div style={{ textAlign: "center", padding: "120px 0" }}>
          <p style={{ fontSize: 14, color: "#e07070", fontWeight: 400 }}>{error || "Цуврал олдсонгүй"}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#f7f3ea", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif" }}>
      <style>{css}</style>

      <Header />

      {/* ── BANNER ── */}
      <div style={{ position: "relative", height: isMobile ? 180 : 280, overflow: "hidden" }}>
        <img src={series.banner_url || series.cover_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.35)" }} />
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
              <img src={series.cover_url} alt={series.title} style={{ width: "100%", display: "block" }} />
            </div>
            {!isMobile && (
              <>
                {latestChapter && (
                  <button className="cta-btn" onClick={() => navigate(`/read/${series.id}/${latestChapter.chapter_number}`)} style={{ width: "100%", marginTop: 14, background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "13px", borderRadius: 6, fontSize: 14, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: "0 8px 24px rgba(201,168,76,0.3)" }}>▶ Уншиж эхлэх</button>
                )}
                <button className="ghost-btn" onClick={toggleBookmark} style={{ width: "100%", marginTop: 8, background: bookmarked ? "rgba(201,168,76,0.1)" : "transparent", border: `1px solid ${bookmarked ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.1)"}`, color: bookmarked ? "#c9a84c" : "rgba(247,243,234,0.5)", padding: "11px", borderRadius: 6, fontSize: 14, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {bookmarked ? "✦ Хадгалсан" : "☆ Хадгалах"}
                </button>
              </>
            )}
          </div>

          {/* Info */}
          <div style={{ paddingTop: isMobile ? 0 : 100 }}>
            <div className="fade-up fade-up-1" style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              {series.genres?.map((g) => (
                <span key={g.id} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 3, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "#c9a84c", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>{g.name}</span>
              ))}
              <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 3, background: "rgba(100,180,100,0.1)", border: "1px solid rgba(100,180,100,0.2)", color: "#80c480", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>{series.status}</span>
            </div>

            <h1 className="fade-up fade-up-2" style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: isMobile ? 24 : 38, fontWeight: 700, lineHeight: 1.2, marginBottom: 14, color: "#f7f3ea" }}>
              {series.title}
            </h1>

            <div className="fade-up fade-up-2" style={{ display: "flex", gap: isMobile ? 16 : 28, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 19, fontWeight: 700, color: "#c9a84c" }}>{series.rating}</span>
                <span style={{ fontSize: 13, color: "rgba(247,243,234,0.4)", fontWeight: 400 }}>/ 10</span>
              </div>
              {[["🔖", bookmarkCount, "Хадгалсан"], ["📖", chapters.length, "Бүлэг"]].map(([icon, val, label]) => (
                <div key={label} style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#f7f3ea" }}>{icon} {val}</span>
                  <span style={{ fontSize: 12, color: "rgba(247,243,234,0.35)", fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
                </div>
              ))}
            </div>

            {isMobile && (
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                {latestChapter && (
                  <button className="cta-btn" onClick={() => navigate(`/read/${series.id}/${latestChapter.chapter_number}`)} style={{ flex: 1, background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "11px", borderRadius: 6, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>▶ Унших</button>
                )}
                <button className="ghost-btn" onClick={toggleBookmark} style={{ flex: 1, background: bookmarked ? "rgba(201,168,76,0.1)" : "transparent", border: `1px solid ${bookmarked ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.15)"}`, color: bookmarked ? "#c9a84c" : "rgba(247,243,234,0.5)", padding: "11px", borderRadius: 6, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {bookmarked ? "✦ Хадгалсан" : "☆ Хадгалах"}
                </button>
              </div>
            )}

            <div className="fade-up fade-up-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "16px", marginBottom: 16 }}>
              <p style={{ fontSize: isMobile ? 15 : 16, fontWeight: 400, lineHeight: 1.7, color: "rgba(247,243,234,0.8)", whiteSpace: "pre-line" }}>{series.description}</p>
            </div>

            <div className="fade-up fade-up-3" style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[["Зохиолч", series.author], ["Зураач", series.artist]].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 12, color: "rgba(247,243,234,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3, fontWeight: 400 }}>{label}</div>
                  <div style={{ fontSize: 14, color: "#c9a84c", fontWeight: 400 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 24, display: "flex" }}>
          {[["chapters", "Бүлгүүд"], ["details", "Дэлгэрэнгүй"]].map(([val, label]) => (
            <button key={val} className="tab-btn" onClick={() => setActiveTab(val)} style={{
              padding: "12px 24px", fontSize: 14,
              fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: activeTab === val ? 500 : 300,
              color: activeTab === val ? "#c9a84c" : "rgba(247,243,234,0.4)",
              background: "none", letterSpacing: "0.08em", textTransform: "uppercase",
              borderBottom: activeTab === val ? "2px solid #c9a84c" : "2px solid transparent",
              marginBottom: -1,
            }}>{label}</button>
          ))}
        </div>

        {activeTab === "chapters" && (
          <div style={{ marginBottom: 60 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: "rgba(247,243,234,0.4)", fontWeight: 400 }}>{chapters.length} бүлэг нийт</span>
              <button onClick={() => setSortDesc(!sortDesc)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "6px 14px", fontSize: 13, color: "rgba(247,243,234,0.5)", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {sortDesc ? "↓ Шинэ эхэндээ" : "↑ Хуучин эхэндээ"}
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {sorted.map((ch) => (
                <div key={ch.id} className="chapter-row" onClick={() => navigate(`/read/${series.id}/${ch.chapter_number}`)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "12px 12px" : "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", borderLeft: "2px solid transparent" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 14 }}>
                    <span style={{ fontSize: 13, color: "#c9a84c", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500, minWidth: 44 }}>Ch. {ch.chapter_number}</span>
                    <span style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: isMobile ? 14 : 15, color: "#f7f3ea" }}>{ch.title}</span>
                    {isRecent(ch.created_at) && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 3, background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>Шинэ</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {!isMobile && <span style={{ fontSize: 13, color: "rgba(247,243,234,0.3)", fontWeight: 400 }}>{timeAgo(ch.created_at)}</span>}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                </div>
              ))}
            </div>

            {!showAll && chapters.length > 6 && (
              <button onClick={() => setShowAll(true)} className="ghost-btn" style={{ width: "100%", marginTop: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "12px", fontSize: 13, color: "rgba(247,243,234,0.4)", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Бүгдийг харах ({chapters.length} бүлэг) ↓
              </button>
            )}
          </div>
        )}

        {activeTab === "details" && (
          <div style={{ marginBottom: 60 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, maxWidth: 600 }}>
              {[
                ["Гарчиг", series.title],
                ["Зохиолч", series.author],
                ["Зураач", series.artist],
                ["Төлөв", series.status],
                ["Нийт бүлэг", chapters.length],
                ["Хадгалсан", bookmarkCount],
              ].map(([label, val]) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 12, color: "rgba(247,243,234,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5, fontWeight: 400 }}>{label}</div>
                  <div style={{ fontSize: 15, color: "#f7f3ea", fontWeight: 400 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RELATED ── */}
        {related.length > 0 && (
          <div style={{ marginBottom: 60 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>✦ Танд таалагдаж болох</div>
              <h2 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: isMobile ? 21 : 24, fontWeight: 700, color: "#f7f3ea" }}>Төстэй цуврал</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: isMobile ? 12 : 20 }}>
              {related.map(s => (
                <div key={s.id} className="related-card" onClick={() => navigate(`/series/${s.id}`)} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                  <div style={{ position: "relative", paddingBottom: "140%", overflow: "hidden" }}>
                    <img className="related-img" src={s.cover_url} alt={s.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,16,0.8) 0%, transparent 60%)" }} />
                    <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(8,8,16,0.7)", backdropFilter: "blur(8px)", borderRadius: 3, padding: "3px 7px", display: "flex", alignItems: "center", gap: 3, border: "1px solid rgba(201,168,76,0.2)" }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      <span style={{ fontSize: 12, color: "#c9a84c", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500 }}>{s.rating}</span>
                    </div>
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    <h3 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: isMobile ? 13 : 15, fontWeight: 700, color: "#f7f3ea", marginBottom: 4, lineHeight: 1.3 }}>{s.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}