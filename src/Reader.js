import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useWindowSize from "./useWindowSize";
const width = useWindowSize();
const isMobile = width < 768;
// Simulate chapter pages with placeholder images
const generatePages = (count) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    src: `https://picsum.photos/seed/page${i + 1}manga/800/${580 + (i % 4) * 80}`,
    width: 800,
    height: 580 + (i % 4) * 80,
  }));

const CHAPTERS = [
  { id: 154, title: "The Weight of a Crown" },
  { id: 155, title: "A Shattered Vow" },
  { id: 156, title: "When Empires Fall" },
  { id: 157, title: "The New Dawn", locked: true },
];

const PAGES = generatePages(12);

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #080810; }
  ::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 4px; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

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

  .gold-shimmer {
    background: linear-gradient(90deg, #c9a84c, #f0d080, #c9a84c);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }

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
  const { series, chapter } = useParams();
  const CURRENT = Number(chapter) || 156;
  useEffect(() => {
  if (scrollRef.current) {
    scrollRef.current.scrollTop = 0;
  }
  setCurrentPage(1);
  setLoadedPages({});
}, [chapter]);
  const [currentPage, setCurrentPage] = useState(1);
  const [readMode, setReadMode] = useState("scroll"); // scroll | paged
  const [width, setWidth] = useState("comfortable"); // compact | comfortable | wide | full
  const [showUI, setShowUI] = useState(true);
  const [showChapters, setShowChapters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showсэтгэгдэл, setShowсэтгэгдэл] = useState(false);
  const [loadedPages, setLoadedPages] = useState({});
  const [isDark, setIsDark] = useState(true);
  const [comment, setComment] = useState("");
  const scrollRef = useRef(null);
  const hideTimer = useRef(null);
  const pageRefs = useRef({});

  const widthMap = { compact: 560, comfortable: 720, wide: 900, full: "100%" };
  const maxW = widthMap[width];

  const progress = Math.round((currentPage / PAGES.length) * 100);

  // Track scroll position for current page in scroll mode
  useEffect(() => {
    if (readMode !== "scroll") return;
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const scrollTop = el.scrollTop;
      let closest = 1;
      let minDist = Infinity;
      Object.entries(pageRefs.current).forEach(([pg, ref]) => {
        if (!ref) return;
        const dist = Math.abs(ref.offsetTop - scrollTop - 120);
        if (dist < minDist) { minDist = dist; closest = Number(pg); }
      });
      setCurrentPage(closest);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [readMode]);

  // Auto-hide UI on scroll mode
  const resetHideTimer = useCallback(() => {
    setShowUI(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowUI(false), 3500);
  }, []);

  useEffect(() => {
    resetHideTimer();
    return () => clearTimeout(hideTimer.current);
  }, []);

  const goPage = (n) => {
    const clamped = Math.max(1, Math.min(PAGES.length, n));
    setCurrentPage(clamped);
    if (readMode === "scroll" && pageRefs.current[clamped]) {
      pageRefs.current[clamped].scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePageLoad = (id) => setLoadedPages(p => ({ ...p, [id]: true }));

  const bg = isDark ? "#080810" : "#f0ece4";
  const text = isDark ? "#e8e0d0" : "#1a1410";
  const sub = isDark ? "rgba(232,224,208,0.45)" : "rgba(26,20,16,0.5)";
  const surface = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const readerBg = isDark ? "#0d0d18" : "#e8e4dc";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: bg, color: text, fontFamily: "'Montserrat', sans-serif", overflow: "hidden", transition: "background 0.3s" }}>
      <style>{css}</style>

      {/* ── TOP BAR ── */}
      <div className="slide-down" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: isDark ? "rgba(8,8,16,0.95)" : "rgba(240,236,228,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${isDark ? "rgba(201,168,76,0.12)" : "rgba(201,168,76,0.2)"}`,
        padding: "0 20px",
        transform: showUI ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.3s ease",
      }} onClick={resetHideTimer}>
        <div style={{ height: 56, display: "flex", alignItems: "center", gap: 16, maxWidth: 1400, margin: "0 auto" }}>

          {/* Left: Home + Series */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button className="icon-btn" onClick={() => navigate("/")} style={{ color: sub, padding: 8, borderRadius: 6 }}>
  <HomeIcon />
</button>
            <span style={{ color: sub, fontSize: 12 }}>/</span>
            <span onClick={() => navigate("/series/1")} style={{ fontSize: 12, color: sub, fontFamily: "'Montserrat'", fontWeight: 300, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}>The Remarried Empress</span>
            <span style={{ color: sub, fontSize: 12 }}>/</span>
          </div>

          {/* Center: Chapter selector */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => { setShowChapters(!showChapters); setShowSettings(false); }} style={{
                background: surface, border: `1px solid ${isDark ? "rgba(201,168,76,0.2)" : "rgba(201,168,76,0.3)"}`,
                borderRadius: 6, padding: "7px 16px",
                display: "flex", alignItems: "center", gap: 10,
                cursor: "pointer", color: text,
              }}>
                <ListIcon />
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 500 }}>
                  Ch. {CURRENT} — When Empires Fall
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2.5" style={{ transform: showChapters ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="M6 9l6 6 6-6"/></svg>
              </button>

              {/* Chapter dropdown */}
              {showChapters && (
                <div className="slide-down" style={{
                  position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
                  background: isDark ? "#12121e" : "#f8f4ec",
                  border: `1px solid ${isDark ? "rgba(201,168,76,0.15)" : "rgba(201,168,76,0.25)"}`,
                  borderRadius: 8, overflow: "hidden",
                  width: 280, boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                  zIndex: 300,
                }}>
                  <div style={{ padding: "10px 14px", borderBottom: `1px solid ${border}`, fontSize: 10, color: "#c9a84c", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 500 }}>Chapters</div>
                  {CHAPTERS.map(ch => (
                    <div key={ch.id} className="chapter-item" onClick={() => { if (!ch.locked) { navigate(`/read/${series}/${ch.id}`); setShowChapters(false); } }} style={{
                      padding: "12px 16px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: ch.id === CURRENT ? "rgba(201,168,76,0.08)" : "transparent",
                      borderLeft: ch.id === CURRENT ? "2px solid #c9a84c" : "2px solid transparent",
                    }}>
                      <div>
                        <div style={{ fontSize: 13, color: ch.locked ? sub : text, fontFamily: "'Playfair Display', serif" }}>Ch. {ch.id}</div>
                        <div style={{ fontSize: 11, color: sub, marginTop: 2, fontWeight: 300 }}>{ch.title}</div>
                      </div>
                      {ch.id === CURRENT && <span style={{ fontSize: 9, color: "#c9a84c", background: "rgba(201,168,76,0.1)", padding: "2px 8px", borderRadius: 3, letterSpacing: "0.1em", textTransform: "uppercase" }}>Reading</span>}
                      {ch.locked && <span style={{ fontSize: 16 }}>🔒</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button className="icon-btn" onClick={() => setBookmarked(!bookmarked)} style={{ color: sub, padding: 8, borderRadius: 6 }}>
              <BookmarkIcon filled={bookmarked} />
            </button>
            <button className="icon-btn" onClick={() => { setShowсэтгэгдэл(!showсэтгэгдэл); setShowSettings(false); setShowChapters(false); }} style={{ color: showсэтгэгдэл ? "#c9a84c" : sub, padding: 8, borderRadius: 6 }}>
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
          position: "fixed", top: 60, right: 16, zIndex: 200,
          background: isDark ? "#12121e" : "#f8f4ec",
          border: `1px solid ${isDark ? "rgba(201,168,76,0.15)" : "rgba(201,168,76,0.25)"}`,
          borderRadius: 10, padding: "20px", width: 260,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontSize: 10, color: "#c9a84c", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, fontWeight: 500 }}>Уншигчийн тохиргоо</div>

          {/* Read mode */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: sub, marginBottom: 8, fontWeight: 300, letterSpacing: "0.08em", textTransform: "uppercase" }}>Уншилтын горим</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[["scroll", "Scroll"], ["paged", "Paged"]].map(([val, label]) => (
                <button key={val} className="setting-btn" onClick={() => setReadMode(val)} style={{
                  flex: 1, padding: "8px", borderRadius: 6, fontSize: 12,
                  fontFamily: "'Montserrat'", fontWeight: 400, cursor: "pointer",
                  background: readMode === val ? "rgba(201,168,76,0.15)" : surface,
                  border: `1px solid ${readMode === val ? "rgba(201,168,76,0.4)" : border}`,
                  color: readMode === val ? "#c9a84c" : sub,
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* Хуудасны өргөн */}
          <div>
            <div style={{ fontSize: 11, color: sub, marginBottom: 8, fontWeight: 300, letterSpacing: "0.08em", textTransform: "uppercase" }}>Хуудасны өргөн</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
              {[["compact", "Compact"], ["comfortable", "Normal"], ["wide", "Wide"], ["full", "Full"]].map(([val, label]) => (
                <button key={val} className="setting-btn" onClick={() => setWidth(val)} style={{
                  padding: "8px", borderRadius: 6, fontSize: 11,
                  fontFamily: "'Montserrat'", fontWeight: 400, cursor: "pointer",
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
      <div ref={scrollRef} onMouseMove={resetHideTimer} style={{
        flex: 1, overflowY: "auto", overflowX: "hidden",
        paddingTop: 58, background: readerBg,
        transition: "background 0.3s",
      }} onClick={() => { setShowChapters(false); setShowSettings(false); resetHideTimer(); }}>

        {/* Pages */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 80 }}>
          {(readMode === "scroll" ? PAGES : [PAGES[currentPage - 1]]).map((page, i) => (
            <div key={page.id} ref={el => pageRefs.current[page.id] = el} style={{
              width: typeof maxW === "number" ? maxW : "100%",
              maxWidth: typeof maxW === "number" ? maxW : "100%",
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
                  fontSize: 10, color: "rgba(201,168,76,0.7)",
                  fontFamily: "'Montserrat'", fontWeight: 300,
                  border: "1px solid rgba(201,168,76,0.15)",
                }}>{page.id} / {PAGES.length}</div>
              )}

              {/* Loading placeholder */}
              {!loadedPages[page.id] && (
                <div style={{
                  width: "100%", paddingBottom: `${(page.height / page.width) * 100}%`,
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
                className={`page-img ${loadedPages[page.id] ? "loaded" : "loading"}`}
                src={page.src}
                alt={`Page ${page.id}`}
                onLoad={() => handlePageLoad(page.id)}
                style={{ display: loadedPages[page.id] ? "block" : "none" }}
              />
            </div>
          ))}

          {/* End of Chapter */}
          {(readMode === "scroll" || currentPage === PAGES.length) && (
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
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: text, marginBottom: 8 }}>End of Chapter {CURRENT}</h3>
              <p style={{ fontSize: 13, color: sub, fontWeight: 300, marginBottom: 28, lineHeight: 1.6 }}>
                When Empires Fall · The Remarried Empress
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button className="nav-btn" onClick={() => navigate(`/read/empress/${CURRENT - 1}`)} style={{
  background: surface, border: `1px solid ${border}`,
  color: sub, padding: "11px 22px",
                  borderRadius: 6, fontSize: 12,
                  fontFamily: "'Montserrat'", fontWeight: 400, letterSpacing: "0.08em",
                  display: "flex", alignItems: "center", gap: 8,
                }}><ChevronLeft /> Өмнөх Бүлэг</button>
                <button className="nav-btn" onClick={() => navigate(`/read/empress/${CURRENT + 1}`)} style={{
  background: "linear-gradient(135deg, #c9a84c, #8a6020)",
  color: "#080810", padding: "11px 22px",
                  borderRadius: 6, fontSize: 12,
                  fontFamily: "'Montserrat'", fontWeight: 500, letterSpacing: "0.1em",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 6px 20px rgba(201,168,76,0.3)",
                }}>Дараагийн Бүлэг <ChevronRight /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="slide-up" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
        background: isDark ? "rgba(8,8,16,0.95)" : "rgba(240,236,228,0.95)",
        backdropFilter: "blur(20px)",
        borderTop: `1px solid ${isDark ? "rgba(201,168,76,0.12)" : "rgba(201,168,76,0.2)"}`,
        transform: showUI ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.3s ease",
      }} onClick={resetHideTimer}>

        {readMode === "paged" ? (
          /* Paged navigation */
          <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center", gap: 20, padding: "0 20px" }}>
            <button className="nav-btn" onClick={() => goPage(currentPage - 1)} disabled={currentPage === 1} style={{
              background: currentPage === 1 ? "transparent" : surface,
              border: `1px solid ${currentPage === 1 ? "transparent" : border}`,
              color: currentPage === 1 ? "rgba(232,224,208,0.2)" : text,
              padding: "8px 20px", borderRadius: 6,
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 13, fontFamily: "'Montserrat'",
            }}><ChevronLeft /> Previous</button>

            {/* Page dots */}
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {PAGES.map(p => (
                <div key={p.id} onClick={() => goPage(p.id)} style={{
                  width: p.id === currentPage ? 18 : 6,
                  height: 6, borderRadius: 3,
                  background: p.id === currentPage ? "#c9a84c" : (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"),
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }} />
              ))}
            </div>

            <button className="nav-btn" onClick={() => goPage(currentPage + 1)} disabled={currentPage === PAGES.length} style={{
              background: currentPage === PAGES.length ? "transparent" : "linear-gradient(135deg, #c9a84c, #8a6020)",
              border: `1px solid ${currentPage === PAGES.length ? "transparent" : "transparent"}`,
              color: currentPage === PAGES.length ? "rgba(232,224,208,0.2)" : "#080810",
              padding: "8px 20px", borderRadius: 6,
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 13, fontFamily: "'Montserrat'", fontWeight: 500,
              boxShadow: currentPage === PAGES.length ? "none" : "0 4px 16px rgba(201,168,76,0.3)",
            }}>Next <ChevronRight /></button>
          </div>
        ) : (
          /* Scroll progress bar */
          <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 24px", gap: 16 }}>
            <span style={{ fontSize: 12, color: sub, fontFamily: "'Montserrat'", fontWeight: 300, minWidth: 30 }}>
              {currentPage}
            </span>
            <div style={{ flex: 1, height: 4, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)", borderRadius: 2, position: "relative", cursor: "pointer" }}
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                goPage(Math.round(ratio * PAGES.length));
              }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #c9a84c, #f0d080)", borderRadius: 2, transition: "width 0.15s" }} />
              <div className="progress-thumb" style={{
                position: "absolute", top: "50%", left: `${progress}%`,
                transform: "translate(-50%, -50%)",
                width: 14, height: 14, borderRadius: "50%",
                background: "#c9a84c",
                boxShadow: "0 0 8px rgba(201,168,76,0.6)",
              }} />
            </div>
            <span style={{ fontSize: 12, color: sub, fontFamily: "'Montserrat'", fontWeight: 300, minWidth: 30, textAlign: "right" }}>
              {PAGES.length}
            </span>
            <span style={{ fontSize: 11, color: "#c9a84c", fontFamily: "'Montserrat'", fontWeight: 500, minWidth: 36 }}>
              {progress}%
            </span>
          </div>
        )}
      </div>

      {/* ── сэтгэгдэл PANEL ── */}
      {showсэтгэгдэл && (
        <div className="slide-down" style={{
          position: "fixed", top: 60, right: 16, bottom: 70, zIndex: 199,
          width: 320,
          background: isDark ? "#0f0f1e" : "#f5f1e8",
          border: `1px solid ${isDark ? "rgba(201,168,76,0.15)" : "rgba(201,168,76,0.25)"}`,
          borderRadius: 10,
          display: "flex", flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: text }}>сэтгэгдэл</span>
            <span style={{ fontSize: 10, color: sub, fontFamily: "'Montserrat'", fontWeight: 300 }}>Ch. {CURRENT} · 3 сэтгэгдэл</span>
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
                  fontSize: 13, color: "#080810", fontWeight: 600, fontFamily: "'Montserrat'",
                }}>{c.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#c9a84c", fontWeight: 500, fontFamily: "'Montserrat'" }}>{c.user}</span>
                    <span style={{ fontSize: 10, color: sub, fontWeight: 300, fontFamily: "'Montserrat'" }}>{c.time}</span>
                  </div>
                  <p style={{ fontSize: 12, color: text, lineHeight: 1.6, fontWeight: 300, fontFamily: "'Montserrat'" }}>{c.text}</p>
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
                fontFamily: "'Montserrat'", fontSize: 12, fontWeight: 300,
                color: text, marginBottom: 8,
                transition: "border-color 0.2s",
              }}
            />
            <button style={{
              width: "100%", padding: "9px",
              background: comment.trim() ? "linear-gradient(135deg, #c9a84c, #8a6020)" : surface,
              border: `1px solid ${comment.trim() ? "transparent" : border}`,
              borderRadius: 6, fontSize: 11,
              fontFamily: "'Montserrat'", fontWeight: 500,
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