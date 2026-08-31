import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useWindowSize from "./useWindowSize";
import { FONT_IMPORT, baseCss } from "./sharedStyles";
import { getSeriesById, getChapterWithPages, getChaptersForSeries } from "./lib/series";
import { addBookmark, removeBookmark, isBookmarked } from "./lib/bookmarks";
import { recordChapterRead } from "./lib/history";
import useAuth from "./lib/useAuth";

// Pages don't carry stored dimensions, so the loading placeholder uses a
// typical manhwa page aspect ratio to minimize layout shift while it loads.
const DEFAULT_PAGE_RATIO = 1.45;

const css = `
  ${FONT_IMPORT}
  ${baseCss}

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  .fade-in { animation: fadeIn 0.4s ease both; }
  .slide-down { animation: slideDown 0.3s ease both; }
  .slide-up { animation: slideUp 0.3s ease both; }

  .page-img {
    display: block;
    width: 100%;
    height: auto;
    transition: opacity 0.3s ease;
  }
  .page-img.loading { opacity: 0; }
  .page-img.loaded { opacity: 1; }

  .nav-btn {
    cursor: pointer; border: none;
    transition: all 0.2s ease;
  }
  .nav-btn:hover { opacity: 0.8; transform: scale(1.05); }
  .nav-btn:active { transform: scale(0.97); }

  .icon-btn {
    cursor: pointer; border: none; background: none;
    transition: all 0.2s ease;
    display: flex; align-items: center; justify-content: center;
  }
  .icon-btn:hover { color: #c9a84c !important; }

  .chapter-item {
    cursor: pointer;
    transition: background 0.15s;
    border-radius: 4px;
  }
  .chapter-item:hover { background: rgba(201,168,76,0.08) !important; }

  .setting-btn {
    cursor: pointer; border: none;
    transition: all 0.18s ease;
  }
  .setting-btn:hover { border-color: rgba(201,168,76,0.5) !important; color: #c9a84c !important; }

  .progress-thumb {
    cursor: grab;
    transition: transform 0.15s;
  }
  .progress-thumb:hover { transform: scale(1.3); }
  .progress-thumb:active { cursor: grabbing; }

  .comment-input:focus {
    border-color: rgba(201,168,76,0.5) !important;
    outline: none;
  }
`;

function ChevronLeft() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>;
}
function ChevronRight() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>;
}
function SettingsIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
}
function BookmarkIcon({ filled }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#c9a84c" : "none"} stroke="#c9a84c" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>;
}
function CommentIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
}
function HomeIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>;
}
function ListIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
}
function SunIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
}
function MoonIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>;
}

export default function Reader() {
  const navigate = useNavigate();
  const { series: seriesId, chapter } = useParams();
  const CURRENT = Number(chapter);
  const screenWidth = useWindowSize();
  const isMobile = screenWidth < 768;
  const { user } = useAuth();

  const [seriesInfo, setSeriesInfo] = useState(null);
  const [chapterData, setChapterData] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [readMode, setReadMode] = useState("scroll"); // scroll | paged
  const [width, setWidth] = useState("comfortable"); // compact | comfortable | wide | full
  const [showUI, setShowUI] = useState(true);
  const [showChapters, setShowChapters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [loadedPages, setLoadedPages] = useState({});
  const [isDark, setIsDark] = useState(true);
  const [comment, setComment] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const scrollRef = useRef(null);
  const pageRefs = useRef({});

  const widthMap = { compact: 560, comfortable: 720, wide: 900, full: "100%" };
  const maxW = widthMap[width];

  const pages = useMemo(() => chapterData?.pages || [], [chapterData]);
  // In scroll mode, progress tracks actual scroll position (smooth, updates
  // continuously) instead of jumping only when the "current page" changes.
  // Paged mode has no continuous scroll to track, so it stays page-based.
  const progress = readMode === "scroll"
    ? scrollProgress
    : (pages.length ? Math.round((currentPage / pages.length) * 100) : 0);

  // Fetch this chapter's pages first — that's the only thing the reader
  // needs to start showing content. Series info and the full chapter list
  // (used for the breadcrumb, dropdown, and prev/next buttons) load in the
  // background afterward instead of blocking the initial render.
  useEffect(() => {
    let cancelled = false;
    setDataLoading(true);
    setDataError(null);
    setSeriesInfo(null);
    setAllChapters([]);

    getChapterWithPages(seriesId, CURRENT)
      .then((ch) => { if (!cancelled) setChapterData(ch); })
      .catch((err) => { if (!cancelled) setDataError(err.message); })
      .finally(() => { if (!cancelled) setDataLoading(false); });

    getSeriesById(seriesId).then((s) => { if (!cancelled) setSeriesInfo(s); }).catch(() => {});
    getChaptersForSeries(seriesId).then((chs) => { if (!cancelled) setAllChapters(chs); }).catch(() => {});

    return () => { cancelled = true; };
  }, [seriesId, CURRENT]);

  // Whether the signed-in user has this series bookmarked.
  useEffect(() => {
    if (!user || !seriesInfo) { setBookmarked(false); return; }
    isBookmarked(user.id, seriesInfo.id).then(setBookmarked).catch(() => setBookmarked(false));
  }, [user, seriesInfo]);

  const toggleBookmark = async () => {
    if (!user) { navigate("/auth"); return; }
    if (bookmarked) {
      await removeBookmark(user.id, seriesInfo.id);
      setBookmarked(false);
    } else {
      await addBookmark(user.id, seriesInfo.id);
      setBookmarked(true);
    }
  };

  // Record this chapter as read for the signed-in user.
  useEffect(() => {
    if (user && seriesInfo && chapterData) {
      recordChapterRead(user.id, seriesInfo.id, chapterData.id).catch(() => {});
    }
  }, [user, seriesInfo, chapterData]);

  const chaptersAsc = [...allChapters].sort((a, b) => a.chapter_number - b.chapter_number);
  const chapterIdx = chaptersAsc.findIndex((c) => c.chapter_number === CURRENT);
  const prevChapter = chapterIdx > 0 ? chaptersAsc[chapterIdx - 1] : null;
  const nextChapter = chapterIdx >= 0 && chapterIdx < chaptersAsc.length - 1 ? chaptersAsc[chapterIdx + 1] : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    setCurrentPage(1);
    setLoadedPages({});
  }, [chapter]);

  // Track scroll position for current page in scroll mode. Depends on
  // dataLoading (not just readMode) because the scrollable element doesn't
  // exist yet during the loading-state render — without that, this effect
  // could run once against a null ref and never re-attach once the real
  // element mounts, silently leaving the progress bar dead forever.
  useEffect(() => {
    if (readMode !== "scroll") return;
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const containerTop = el.getBoundingClientRect().top;
      let closest = 1;
      let minDist = Infinity;
      Object.entries(pageRefs.current).forEach(([pg, ref]) => {
        if (!ref) return;
        const dist = Math.abs(ref.getBoundingClientRect().top - containerTop - 120);
        if (dist < minDist) { minDist = dist; closest = Number(pg); }
      });
      setCurrentPage(closest);

      const scrollable = el.scrollHeight - el.clientHeight;
      setScrollProgress(scrollable > 0 ? Math.min(100, Math.max(0, Math.round((el.scrollTop / scrollable) * 100))) : 0);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [readMode, dataLoading]);

  const goPage = useCallback((n) => {
    const clamped = Math.max(1, Math.min(pages.length, n));
    setCurrentPage(clamped);
    if (readMode === "scroll" && pageRefs.current[clamped]) {
      pageRefs.current[clamped].scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [pages.length, readMode]);

  // Tapping the reader closes any open panel first. Otherwise: in paged
  // mode the left/right edges page back/forward (no more Prev/Next bar),
  // and the middle — or any tap in scroll mode — toggles the header so
  // images can fill the whole screen.
  const handleReaderTap = useCallback((e) => {
    if (showChapters || showSettings || showComments) {
      setShowChapters(false);
      setShowSettings(false);
      setShowComments(false);
      return;
    }
    if (readMode === "paged") {
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      if (ratio < 0.3) { goPage(currentPage - 1); return; }
      if (ratio > 0.7) { goPage(currentPage + 1); return; }
    }
    setShowUI(v => !v);
  }, [showChapters, showSettings, showComments, readMode, currentPage, goPage]);

  const handlePageLoad = (id) => setLoadedPages(p => ({ ...p, [id]: true }));

  const bg = isDark ? "#080810" : "#f0ece4";
  const text = isDark ? "#f7f3ea" : "#1a1410";
  const sub = isDark ? "rgba(247,243,234,0.45)" : "rgba(26,20,16,0.5)";
  const surface = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const readerBg = isDark ? "#0d0d18" : "#e8e4dc";

  if (dataLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: bg, color: text, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif" }}>
        <style>{css}</style>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          border: "2px solid rgba(201,168,76,0.2)",
          borderTopColor: "#c9a84c",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ fontSize: 14, color: "rgba(247,243,234,0.35)", fontWeight: 400 }}>Ачааллаж байна...</p>
      </div>
    );
  }

  if (dataError || !chapterData) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: bg, color: text, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif" }}>
        <style>{css}</style>
        <p style={{ fontSize: 14, color: "#e07070", fontWeight: 400 }}>{dataError || "Бүлэг олдсонгүй"}</p>
        <button className="nav-btn" onClick={() => navigate(`/series/${seriesId}`)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: text, padding: "10px 20px", borderRadius: 6, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif" }}>← Цуврал руу буцах</button>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: bg, color: text, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", overflow: "hidden", transition: "background 0.3s" }}>
      <style>{css}</style>

      {/* ── TOP BAR ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: isDark ? "rgba(8,8,16,0.95)" : "rgba(240,236,228,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${isDark ? "rgba(201,168,76,0.12)" : "rgba(201,168,76,0.2)"}`,
        padding: "0 20px",
        transform: showUI ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.3s ease",
      }}>
        <div style={{ height: 56, display: "flex", alignItems: "center", gap: 16, maxWidth: 1400, margin: "0 auto" }}>

          {/* Left: Home + Series */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button className="icon-btn" onClick={() => navigate("/")} style={{ color: sub, padding: 8, borderRadius: 6 }}>
  <HomeIcon />
</button>
            {!isMobile && seriesInfo && (
              <>
                <span style={{ color: sub, fontSize: 13 }}>/</span>
                <span onClick={() => navigate(`/series/${seriesInfo.id}`)} style={{ fontSize: 13, color: sub, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 400, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}>{seriesInfo.title}</span>
                <span style={{ color: sub, fontSize: 13 }}>/</span>
              </>
            )}
          </div>

          {/* Center: Chapter selector */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center", minWidth: 0 }}>
            <div style={{ position: "relative", minWidth: 0 }}>
              <button onClick={() => { setShowChapters(!showChapters); setShowSettings(false); }} style={{
                background: surface, border: `1px solid ${isDark ? "rgba(201,168,76,0.2)" : "rgba(201,168,76,0.3)"}`,
                borderRadius: 6, padding: isMobile ? "7px 10px" : "7px 16px",
                display: "flex", alignItems: "center", gap: isMobile ? 6 : 10,
                cursor: "pointer", color: text, maxWidth: "100%",
              }}>
                <ListIcon />
                <span style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: isMobile ? 13 : 15, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {isMobile ? `Ch. ${CURRENT}` : `Ch. ${CURRENT}${chapterData?.title ? ` — ${chapterData.title}` : ""}`}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2.5" style={{ flexShrink: 0, transform: showChapters ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="M6 9l6 6 6-6"/></svg>
              </button>

              {/* Chapter dropdown */}
              {showChapters && (
                <div className="slide-down" style={{
                  position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
                  background: isDark ? "#12121e" : "#f8f4ec",
                  border: `1px solid ${isDark ? "rgba(201,168,76,0.15)" : "rgba(201,168,76,0.25)"}`,
                  borderRadius: 8, overflow: "hidden",
                  width: 280, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                  zIndex: 300,
                }}>
                  <div style={{ padding: "10px 14px", borderBottom: `1px solid ${border}`, fontSize: 12, color: "#c9a84c", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 500 }}>Chapters</div>
                  {chaptersAsc.slice().reverse().map(ch => (
                    <div key={ch.id} className="chapter-item" onClick={() => { navigate(`/read/${seriesId}/${ch.chapter_number}`); setShowChapters(false); }} style={{
                      padding: "12px 16px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: ch.chapter_number === CURRENT ? "rgba(201,168,76,0.08)" : "transparent",
                      borderLeft: ch.chapter_number === CURRENT ? "2px solid #c9a84c" : "2px solid transparent",
                    }}>
                      <div>
                        <div style={{ fontSize: 14, color: text, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif" }}>Ch. {ch.chapter_number}</div>
                        <div style={{ fontSize: 13, color: sub, marginTop: 2, fontWeight: 400 }}>{ch.title}</div>
                      </div>
                      {ch.chapter_number === CURRENT && <span style={{ fontSize: 11, color: "#c9a84c", background: "rgba(201,168,76,0.1)", padding: "2px 8px", borderRadius: 3, letterSpacing: "0.1em", textTransform: "uppercase" }}>Reading</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button className="icon-btn" onClick={toggleBookmark} style={{ color: sub, padding: 8, borderRadius: 6 }}>
              <BookmarkIcon filled={bookmarked} />
            </button>
            <button className="icon-btn" onClick={() => { setShowComments(!showComments); setShowSettings(false); setShowChapters(false); }} style={{ color: showComments ? "#c9a84c" : sub, padding: 8, borderRadius: 6 }}>
              <CommentIcon />
            </button>
            <button className="icon-btn" onClick={() => setIsDark(!isDark)} style={{ color: sub, padding: 8, borderRadius: 6 }}>
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button className="icon-btn" onClick={() => { setShowSettings(!showSettings); setShowChapters(false); }} style={{ color: showSettings ? "#c9a84c" : sub, padding: 8, borderRadius: 6 }}>
              <SettingsIcon />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 2, background: border, position: "relative" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #c9a84c, #f0d080)", transition: "width 0.3s ease", borderRadius: 2 }} />
        </div>
      </div>

      {/* ── SETTINGS PANEL ── */}
      {showSettings && (
        <div className="slide-down" style={{
          position: "fixed", top: 60, right: isMobile ? 8 : 16, left: isMobile ? 8 : "auto", zIndex: 200,
          background: isDark ? "#12121e" : "#f8f4ec",
          border: `1px solid ${isDark ? "rgba(201,168,76,0.15)" : "rgba(201,168,76,0.25)"}`,
          borderRadius: 10, padding: "20px", width: isMobile ? "auto" : 260,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontSize: 12, color: "#c9a84c", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, fontWeight: 500 }}>Уншигчийн тохиргоо</div>

          {/* Read mode */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, color: sub, marginBottom: 8, fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>Уншилтын горим</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[["scroll", "Scroll"], ["paged", "Paged"]].map(([val, label]) => (
                <button key={val} className="setting-btn" onClick={() => setReadMode(val)} style={{
                  flex: 1, padding: "8px", borderRadius: 6, fontSize: 13,
                  fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 400, cursor: "pointer",
                  background: readMode === val ? "rgba(201,168,76,0.15)" : surface,
                  border: `1px solid ${readMode === val ? "rgba(201,168,76,0.4)" : border}`,
                  color: readMode === val ? "#c9a84c" : sub,
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* Хуудасны өргөн */}
          <div>
            <div style={{ fontSize: 13, color: sub, marginBottom: 8, fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>Хуудасны өргөн</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
              {[["compact", "Compact"], ["comfortable", "Normal"], ["wide", "Wide"], ["full", "Full"]].map(([val, label]) => (
                <button key={val} className="setting-btn" onClick={() => setWidth(val)} style={{
                  padding: "8px", borderRadius: 6, fontSize: 13,
                  fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 400, cursor: "pointer",
                  background: width === val ? "rgba(201,168,76,0.15)" : surface,
                  border: `1px solid ${width === val ? "rgba(201,168,76,0.4)" : border}`,
                  color: width === val ? "#c9a84c" : sub,
                }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN READER AREA ── */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: "auto", overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        paddingTop: 58, background: readerBg,
        transition: "background 0.3s",
      }} onClick={handleReaderTap}>

        {/* Pages */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 80 }}>
          {(readMode === "scroll" ? pages : [pages[currentPage - 1]]).filter(Boolean).map((page) => (
            <div key={page.id} ref={el => pageRefs.current[page.page_number] = el} style={{
              width: "100%",
              maxWidth: isMobile ? "100%" : (typeof maxW === "number" ? maxW : "100%"),
              margin: readMode === "scroll" ? "0" : "20px auto",
              position: "relative",
              animation: readMode === "paged" ? "fadeIn 0.3s ease" : "none",
            }}>
              {/* Page number badge */}
              {readMode === "scroll" && (
                <div style={{
                  position: "absolute", top: 12, right: 12, zIndex: 10,
                  background: "rgba(8,8,16,0.7)", backdropFilter: "blur(8px)",
                  borderRadius: 4, padding: "3px 8px",
                  fontSize: 12, color: "rgba(201,168,76,0.7)",
                  fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 400,
                  border: "1px solid rgba(201,168,76,0.15)",
                }}>{page.page_number} / {pages.length}</div>
              )}

              {/* Loading placeholder */}
              {!loadedPages[page.page_number] && (
                <div style={{
                  width: "100%", paddingBottom: `${DEFAULT_PAGE_RATIO * 100}%`,
                  background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}>
                  <div style={{
                    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                    width: 28, height: 28, borderRadius: "50%",
                    border: "2px solid rgba(201,168,76,0.2)",
                    borderTopColor: "#c9a84c",
                    animation: "spin 0.8s linear infinite",
                  }} />
                </div>
              )}
              <img
                className={`page-img ${loadedPages[page.page_number] ? "loaded" : "loading"}`}
                src={page.image_url}
                alt={`Page ${page.page_number}`}
                onLoad={() => handlePageLoad(page.page_number)}
                fetchPriority={page.page_number === 1 ? "high" : "auto"}
              />
            </div>
          ))}

          {/* End of Chapter */}
          {pages.length > 0 && (readMode === "scroll" || currentPage === pages.length) && (
            <div className="fade-in" style={{
              width: typeof maxW === "number" ? Math.min(maxW, 720) : 720,
              maxWidth: "90vw",
              margin: "40px auto 20px",
              background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
              border: `1px solid ${isDark ? "rgba(201,168,76,0.15)" : "rgba(201,168,76,0.25)"}`,
              borderRadius: 12, padding: "32px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>✦</div>
              <h3 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 21, fontWeight: 700, color: text, marginBottom: 8 }}>End of Chapter {CURRENT}</h3>
              <p style={{ fontSize: 14, color: sub, fontWeight: 400, marginBottom: 28, lineHeight: 1.6 }}>
                {chapterData?.title} · {seriesInfo?.title}
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button className="nav-btn" disabled={!prevChapter} onClick={() => prevChapter && navigate(`/read/${seriesId}/${prevChapter.chapter_number}`)} style={{
                  background: prevChapter ? surface : "transparent", border: `1px solid ${prevChapter ? border : "transparent"}`,
                  color: prevChapter ? sub : "rgba(247,243,234,0.2)", padding: "11px 22px",
                  borderRadius: 6, fontSize: 13,
                  fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 400, letterSpacing: "0.08em",
                  display: "flex", alignItems: "center", gap: 8,
                  cursor: prevChapter ? "pointer" : "default",
                }}><ChevronLeft /> Өмнөх Бүлэг</button>
                <button className="nav-btn" disabled={!nextChapter} onClick={() => nextChapter && navigate(`/read/${seriesId}/${nextChapter.chapter_number}`)} style={{
                  background: nextChapter ? "linear-gradient(135deg, #c9a84c, #8a6020)" : "transparent",
                  border: `1px solid ${nextChapter ? "transparent" : border}`,
                  color: nextChapter ? "#080810" : "rgba(247,243,234,0.2)", padding: "11px 22px",
                  borderRadius: 6, fontSize: 13,
                  fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500, letterSpacing: "0.1em",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: nextChapter ? "0 6px 20px rgba(201,168,76,0.3)" : "none",
                  cursor: nextChapter ? "pointer" : "default",
                }}>Дараагийн Бүлэг <ChevronRight /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── COMMENTS PANEL ── */}
      {showComments && (
        <div className="slide-down" style={{
          position: "fixed", top: 60, right: isMobile ? 8 : 16, left: isMobile ? 8 : "auto", bottom: 70, zIndex: 199,
          width: isMobile ? "auto" : 320,
          background: isDark ? "#0f0f1e" : "#f5f1e8",
          border: `1px solid ${isDark ? "rgba(201,168,76,0.15)" : "rgba(201,168,76,0.25)"}`,
          borderRadius: 10,
          display: "flex", flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 17, fontWeight: 700, color: text }}>сэтгэгдэл</span>
            <span style={{ fontSize: 12, color: sub, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 400 }}>Ch. {CURRENT} · 3 сэтгэгдэл</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
            {[
              { user: "Narantsetseg", time: "2h ago", text: "The emperor's expression in this chapter... 😭 He finally understands what he lost.", avatar: "N" },
              { user: "Munkhjin", time: "5h ago", text: "Chapter 156 hits different. The art in the last few pages is incredible.", avatar: "M" },
              { user: "Altantsetseg", time: "1d ago", text: "I've been waiting for this chapter for 2 weeks. Worth every second.", avatar: "A" },
            ].map((c, i) => (
              <div key={i} style={{ marginBottom: 16, display: "flex", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #c9a84c, #8a6020)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: "#080810", fontWeight: 600, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif",
                }}>{c.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: "#c9a84c", fontWeight: 500, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif" }}>{c.user}</span>
                    <span style={{ fontSize: 12, color: sub, fontWeight: 400, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif" }}>{c.time}</span>
                  </div>
                  <p style={{ fontSize: 14, color: text, lineHeight: 1.6, fontWeight: 400, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif" }}>{c.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "12px 14px", borderTop: `1px solid ${border}` }}>
            <textarea
              className="comment-input"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Сэтгэгдэл бичих..."
              rows={2}
              style={{
                width: "100%", padding: "10px 12px",
                background: surface,
                border: `1px solid ${border}`,
                borderRadius: 6, resize: "none",
                fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 13, fontWeight: 400,
                color: text, marginBottom: 8,
                transition: "border-color 0.2s",
              }}
            />
            <button style={{
              width: "100%", padding: "9px",
              background: comment.trim() ? "linear-gradient(135deg, #c9a84c, #8a6020)" : surface,
              border: `1px solid ${comment.trim() ? "transparent" : border}`,
              borderRadius: 6, fontSize: 13,
              fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: comment.trim() ? "#080810" : sub,
              cursor: comment.trim() ? "pointer" : "default",
              transition: "all 0.2s",
            }}>Нийтлэх</button>
          </div>
        </div>
      )}
    </div>
  );
}