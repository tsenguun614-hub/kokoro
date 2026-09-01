import { supabase, setRememberMe } from "./supabaseClient";

export async function signUp({ email, password, username }) {
  setRememberMe(true); // no "remember me" choice at signup — default to persisted
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password, rememberMe = true }) {
  // Must be set before signing in — the session token is written to
  // localStorage or sessionStorage based on this flag as part of the call.
  setRememberMe(rememberMe);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// provider: "google" | "facebook" — must be enabled in the Supabase dashboard
// (Authentication > Providers) with credentials from that provider's own
// developer console first, or this redirects into an error page.
export async function signInWithOAuth(provider) {
  setRememberMe(true); // no "remember me" choice for OAuth — default to persisted
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Sends an email with a link to /reset-password. Clicking it signs the user
// in via a short-lived recovery session, which ResetPassword.js then uses to
// call updatePassword below.
export async function requestPasswordReset(email) {
  setRememberMe(true); // so the session survives the redirect from the email link
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return data.subscription;
}

export async function getProfile(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single();
  if (error) throw error;
  return data;
}
