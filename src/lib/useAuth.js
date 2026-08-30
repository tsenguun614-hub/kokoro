import { useEffect, useState } from "react";
import { getCurrentUser, onAuthStateChange } from "./auth";

export default function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = not checked yet, null = signed out

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser(null));
    const subscription = onAuthStateChange(setUser);
    return () => subscription.unsubscribe();
  }, []);

  return { user, loading: user === undefined };
}
