import { createClient } from "@/lib/supabase/client";

export type AuthResult = {
  error?: string;
  redirect?: string;
};

export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { redirect: "/dashboard" };
}

export async function signUp(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };
  return { redirect: "/dashboard" };
}

export async function signOut(): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { error: error.message };
  return { redirect: "/login" };
}

export async function resetPassword(
  email: string,
  redirectOrigin?: string
): Promise<AuthResult> {
  const supabase = createClient();
  const origin =
    redirectOrigin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/login/reset-password`,
  });
  if (error) return { error: error.message };
  return {};
}
