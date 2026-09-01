import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useWindowSize from "../useWindowSize";
import { MAX_W, NAV_ITEMS } from "../sharedStyles";
import useAuth from "../lib/useAuth";

// Pass searchValue/onSearchChange for a live-filtering search box (e.g. Browse).
// Without them, the search box navigates to /browse on Enter.
export default function Header({ searchValue, onSearchChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const screenWidth = useWindowSize();
  const isMobile = screenWidth < 768;
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const controlled = onSearchChange !== undefined;
  const { user } = useAuth();
  const initial = (user?.user_metadata?.username || user?.email || "?")[0].toUpperCase();

  return (
    <>
      {/* Mobile menu overlay */}
      {isMobile && menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 98, backdropFilter: "blur(4px)" }} />
      )}

      {/* Mobile slide-out menu */}
      {isMobile && (
        <div style={{
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 99,
          width: 260, background: "#0d0d1a",
          borderRight: "1px solid rgba(201,168,76,0.15)",
          transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          padding: "24px 20px",
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div style={{ width: 30, height: 30, background: "linear-gradient(135deg, #c9a84c, #8a6020)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>⬡</div>
            <span style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 19, fontWeight: 700, color: "#f7f3ea" }}>KOKORO</span>
          </div>
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path;
            return (
              <div key={item.label} onClick={() => { navigate(item.path); setMenuOpen(false); }} style={{
                padding: "14px 16px", borderRadius: 8, cursor: "pointer",
                background: active ? "rgba(201,168,76,0.1)" : "transparent",
                borderLeft: active ? "2px solid #c9a84c" : "2px solid transparent",
                fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif",
                fontSize: 15, fontWeight: active ? 500 : 300,
                color: active ? "#c9a84c" : "rgba(247,243,234,0.6)",
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>{item.label}</div>
            );
          })}
        </div>
      )}

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(8,8,16,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(201,168,76,0.12)", padding: isMobile ? "0 4%" : "0 3%" }}>
        <div style={{ maxWidth: MAX_W, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: isMobile ? 56 : 64 }}>

          {/* Left: hamburger + logo */}
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 12 }}>
            {isMobile && (
              <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", flexDirection: "column", gap: 5, justifyContent: "center" }}>
                <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? "#c9a84c" : "rgba(247,243,234,0.7)", borderRadius: 2, transition: "all 0.2s", transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
                <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? "transparent" : "rgba(247,243,234,0.7)", borderRadius: 2, transition: "all 0.2s" }} />
                <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? "#c9a84c" : "rgba(247,243,234,0.7)", borderRadius: 2, transition: "all 0.2s", transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
              <div style={{ width: isMobile ? 30 : 34, height: isMobile ? 30 : 34, background: "linear-gradient(135deg, #c9a84c, #8a6020)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 15 : 17 }}>⬡</div>
              <div>
                <span style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: isMobile ? 19 : 21, fontWeight: 700, color: "#f7f3ea", letterSpacing: "0.01em" }}>KOKORO</span>
                {!isMobile && <span style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 11, fontWeight: 400, letterSpacing: "0.25em", color: "#c9a84c", textTransform: "uppercase", marginLeft: 8 }}>MANHWA</span>}
              </div>
            </div>
          </div>

          {/* Center: desktop nav */}
          {!isMobile && (
            <nav style={{ display: "flex", gap: 32, alignItems: "center" }}>
              {NAV_ITEMS.map(item => {
                const active = location.pathname === item.path;
                return (
                  <span key={item.label} className="nav-link" onClick={() => navigate(item.path)} style={{
                    fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif",
                    fontSize: 14, fontWeight: active ? 500 : 300,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: active ? "#c9a84c" : "rgba(247,243,234,0.55)",
                    textShadow: active ? "0 0 14px rgba(201,168,76,0.7)" : "none",
                    position: "relative",
                  }}>
                    {item.label}
                    {active && <span style={{ position: "absolute", bottom: -4, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #c9a84c, transparent)" }} />}
                  </span>
                );
              })}
            </nav>
          )}

          {/* Right: search + auth */}
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
            {!isMobile && (
              <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 6, padding: "7px 16px", gap: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                {controlled ? (
                  <input placeholder="Хайх..." value={searchValue} onChange={e => onSearchChange(e.target.value)} style={{ background: "none", border: "none", outline: "none", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 14, color: "#f7f3ea", width: 160, fontWeight: 400 }} />
                ) : (
                  <input placeholder="Хайх..." onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) navigate(`/browse?q=${encodeURIComponent(e.target.value.trim())}`); }} style={{ background: "none", border: "none", outline: "none", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 14, color: "#f7f3ea", width: 160, fontWeight: 400 }} />
                )}
              </div>
            )}
            {isMobile && (
              <button onClick={() => setSearchOpen(!searchOpen)} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>
            )}
            {!isMobile && !user && (
              <button onClick={() => navigate("/auth")} style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 13, color: "#080810", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500, letterSpacing: "0.08em", cursor: "pointer", textTransform: "uppercase" }}>НЭВТРЭХ</button>
            )}
            {!isMobile && user && (
              <div onClick={() => navigate("/profile")} style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #c9a84c, #8a6020)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#080810", cursor: "pointer" }}>{initial}</div>
            )}
            {isMobile && !user && (
              <button onClick={() => navigate("/auth")} style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #c9a84c, #8a6020)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#080810" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </button>
            )}
            {isMobile && user && (
              <button onClick={() => navigate("/profile")} style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #c9a84c, #8a6020)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15, fontWeight: 700, color: "#080810", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif" }}>{initial}</button>
            )}
          </div>
        </div>

        {/* Mobile search expand */}
        {isMobile && searchOpen && (
          <div style={{ padding: "10px 4% 12px", borderTop: "1px solid rgba(201,168,76,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 8, padding: "10px 14px", gap: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              {controlled ? (
                <input autoFocus placeholder="Хайх..." value={searchValue} onChange={e => onSearchChange(e.target.value)} onKeyDown={e => { if (e.key === "Enter") setSearchOpen(false); }} style={{ background: "none", border: "none", outline: "none", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 15, color: "#f7f3ea", flex: 1, fontWeight: 400 }} />
              ) : (
                <input autoFocus placeholder="Хайх..." onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) { navigate(`/browse?q=${encodeURIComponent(e.target.value.trim())}`); setSearchOpen(false); } }} style={{ background: "none", border: "none", outline: "none", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 15, color: "#f7f3ea", flex: 1, fontWeight: 400 }} />
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
