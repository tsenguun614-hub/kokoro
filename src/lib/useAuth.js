import { useEffect, useState } from "react";
import { onAuthStateChange } from "./auth";

export default function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = not checked yet, null = signed out

  useEffect(() => {
    // onAuthStateChange alone is enough — Supabase fires it immediately with
    // the current session on subscribe. Also calling getCurrentUser() here
    // used to race it, firing setUser twice with two different object
    // references for the same user, which re-triggered every effect that
    // depended on `user` (e.g. Profile's data fetch) and caused visible
    // double/triple loading-screen flashes.
    const subscription = onAuthStateChange(setUser);
    return () => subscription.unsubscribe();
  }, []);

  return { user, loading: user === undefined };
}
