"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/dashboard/Logo";
import { useAuth } from "@/lib/hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    const result = await login(email, password);
    setIsLoading(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    // Redirection gérée par login() (window.location.href)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#000000] px-4">
      <Link href="/" className="mb-10">
        <Logo className="h-8 w-auto text-white" />
      </Link>

      <div className="w-full max-w-sm">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[#1e3a5f]/50 bg-[#0a0a0a]/80 p-8 shadow-xl"
        >
          <h1 className="mb-6 text-center text-xl font-semibold text-white">
            Connexion
          </h1>

          {message && (
            <div
              className={`mb-4 rounded-lg px-4 py-3 text-sm ${
                message.type === "error"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-green-500/20 text-green-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-white/90"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="vous@exemple.com"
                className="w-full rounded-lg border border-[#1e3a5f] bg-black/50 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-white/90"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-[#1e3a5f] bg-black/50 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#1e3a5f] px-4 py-3 font-medium text-white transition-colors hover:bg-[#2a4a6f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>

            <Link
              href="/login/forgot-password"
              className="block text-center text-sm text-white/70 underline-offset-2 hover:text-white hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Pas encore de compte ?{" "}
          <Link href="/onboarding" className="text-[#1e3a5f] hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
