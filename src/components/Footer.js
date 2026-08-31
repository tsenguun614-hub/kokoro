import { useNavigate } from "react-router-dom";
import useWindowSize from "../useWindowSize";
import { MAX_W } from "../sharedStyles";

export default function Footer() {
  const navigate = useNavigate();
  const screenWidth = useWindowSize();
  const isMobile = screenWidth < 768;

  return (
    <footer style={{ borderTop: "1px solid rgba(201,168,76,0.1)", padding: isMobile ? "20px 4%" : "28px 3%", background: "rgba(0,0,0,0.3)" }}>
      <div style={{ maxWidth: MAX_W, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{ width: 24, height: 24, background: "linear-gradient(135deg, #c9a84c, #8a6020)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⬡</div>
          <span style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 15, color: "rgba(247,243,234,0.6)" }}>KOKORO Manhwa</span>
        </div>
        <p style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 13, fontWeight: 400, color: "rgba(247,243,234,0.25)" }}>© 2025 · Монгол уншигчдад зориулав</p>
      </div>
    </footer>
  );
}
