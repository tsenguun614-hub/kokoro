import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase project values, then restart the dev server."
  );
}

// "Remember me" support: the session token lives in localStorage (survives
// browser restarts) unless the flag below says otherwise, in which case it
// lives in sessionStorage (cleared when the tab/browser closes). The flag
// itself always lives in localStorage — it's just a tiny preference, not
// the sensitive session data — so it's readable before the client exists.
const REMEMBER_KEY = "kokoro-remember-me";

export function setRememberMe(remember) {
  window.localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
}

const authStorage = {
  getItem: (key) => {
    const store = window.localStorage.getItem(REMEMBER_KEY) === "0" ? window.sessionStorage : window.localStorage;
    return store.getItem(key);
  },
  setItem: (key, value) => {
    const store = window.localStorage.getItem(REMEMBER_KEY) === "0" ? window.sessionStorage : window.localStorage;
    store.setItem(key, value);
  },
  removeItem: (key) => {
    const store = window.localStorage.getItem(REMEMBER_KEY) === "0" ? window.sessionStorage : window.localStorage;
    store.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storage: authStorage },
});
