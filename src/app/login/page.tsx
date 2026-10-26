"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Anmeldung mit 6-stelligem Code statt Link: Eine Web-App auf dem iPhone-Home-Bildschirm
// hat ihre eigenen Cookies, ein Login-Link würde nur Safari anmelden.
export default function Login() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setPending(false);
    if (error) return setError("Der Code konnte nicht gesendet werden. Prüfe die E-Mail-Adresse.");
    setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    setPending(false);
    if (error) return setError("Der Code stimmt nicht oder ist abgelaufen.");
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="app">
      <div className="login">
        <span className="eyebrow">Denkweise</span>
        <h1 className="page-title">Jeden Tag eine Frage. Sokrates hakt nach.</h1>

        {step === "email" ? (
          <form onSubmit={requestCode} className="stack">
            <div className="field">
              <label htmlFor="email">E-Mail-Adresse</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button className="btn" type="submit" disabled={pending}>Code senden</button>
          </form>
        ) : (
          <form onSubmit={verify} className="stack">
            <div className="field">
              <label htmlFor="code">Code aus der E-Mail an {email}</label>
              <input
                id="code"
                className="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <button className="btn" type="submit" disabled={pending || code.length < 6}>Anmelden</button>
            <button className="btn ghost" type="button" onClick={() => setStep("email")}>Andere Adresse</button>
          </form>
        )}
        {error && <p className="error" role="alert">{error}</p>}
      </div>
    </main>
  );
}
