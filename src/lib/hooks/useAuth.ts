"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { signIn as authSignIn, signOut as authSignOut } from "@/lib/auth";

export type UseAuthReturn = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<{ error?: string }>;
};

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string) {
    const result = await authSignIn(email, password);
    if (result.error) return { error: result.error };
    if (result.redirect) window.location.href = result.redirect;
    return {};
  }

  async function logout() {
    const result = await authSignOut();
    if (result.error) return { error: result.error };
    if (result.redirect) window.location.href = result.redirect;
    return {};
  }

  return { user, loading, login, logout };
}
