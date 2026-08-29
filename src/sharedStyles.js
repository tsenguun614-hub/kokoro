export const MAX_W = 1400;

export const NAV_ITEMS = [
  { label: "Нүүр", path: "/" },
  { label: "Бүх гаргалт", path: "/browse" },
  { label: "Bookmarks", path: "/profile" },
];

export const PLAYFAIR_MONTSERRAT_FONTS =
  "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap');";

// Shared keyframes/utility classes used across every page. Font-agnostic —
// pages that use a different type family (e.g. Admin's DM Sans) prepend
// their own @import instead of PLAYFAIR_MONTSERRAT_FONTS.
export const baseCss = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #080810; }
  ::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 4px; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pageEnter { from { opacity: 0; } to { opacity: 1; } }
  @keyframes float { 0%, 100% { transform: translateY(0px) rotate(var(--r)); } 50% { transform: translateY(-8px) rotate(var(--r)); } }

  .page-enter { animation: pageEnter 0.15s ease both; }
  .fade-up { animation: fadeUp 0.5s ease both; }
  .fade-up-1 { animation-delay: 0.08s; }
  .fade-up-2 { animation-delay: 0.18s; }
  .fade-up-3 { animation-delay: 0.28s; }
  .fade-up-4 { animation-delay: 0.38s; }

  .gold-shimmer {
    background: linear-gradient(90deg, #c9a84c, #f0d080, #c9a84c);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }

  .nav-link { cursor: pointer; transition: color 0.2s; text-decoration: none; }
  .nav-link:hover { color: #c9a84c !important; }

  .cta-btn { cursor: pointer; border: none; transition: all 0.2s ease; }
  .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(201,168,76,0.35) !important; }
  .cta-btn:active { transform: translateY(0); }

  .ghost-btn { cursor: pointer; transition: all 0.2s ease; }
  .ghost-btn:hover { background: rgba(201,168,76,0.08) !important; border-color: rgba(201,168,76,0.5) !important; }
`;
