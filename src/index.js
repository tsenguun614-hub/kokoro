import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// No-ops until REACT_APP_SENTRY_DSN is set (see .env.example) — safe to
// leave unset in local dev, or until a Sentry project is created.
if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);

function ErrorFallback() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#080810", color: "#f7f3ea", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", textAlign: "center", padding: "0 24px" }}>
      <p style={{ fontSize: 16 }}>Уучлаарай, ямар нэг зүйл буруу болсон байна.</p>
      <button onClick={() => window.location.reload()} style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", border: "none", padding: "11px 24px", borderRadius: 6, fontSize: 13, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>Дахин ачаалах</button>
    </div>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
