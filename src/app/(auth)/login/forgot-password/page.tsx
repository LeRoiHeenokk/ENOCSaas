"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/dashboard/Logo";
import { resetPassword } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    const result = await resetPassword(email);
    setIsLoading(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage({
      type: "success",
      text: "Si un compte existe pour cet email, vous recevrez un lien de réinitialisation.",
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#000000] px-4">
      <Link href="/login" className="mb-10">
        <Logo className="h-8 w-auto text-white" />
      </Link>

      <div className="w-full max-w-sm">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[#1e3a5f]/50 bg-[#0a0a0a]/80 p-8 shadow-xl"
        >
          <h1 className="mb-2 text-center text-xl font-semibold text-white">
            Mot de passe oublié
          </h1>
          <p className="mb-6 text-center text-sm text-white/70">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>

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
          </div>

          <div className="mt-6 space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#1e3a5f] px-4 py-3 font-medium text-white transition-colors hover:bg-[#2a4a6f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50"
            >
              {isLoading ? "Envoi..." : "Envoyer le lien"}
            </button>

            <Link
              href="/login"
              className="block text-center text-sm text-white/70 underline-offset-2 hover:text-white hover:underline"
            >
              Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
