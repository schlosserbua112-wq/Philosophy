"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Anmeldung mit E-Mail und Passwort direkt in der App: Eine Web-App auf dem iPhone-Home-Bildschirm
// hat ihre eigenen Cookies, ein Login-Link aus einer E-Mail würde nur Safari anmelden.
export default function Login() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"anmelden" | "registrieren">("anmelden");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);

    const credentials = { email: email.trim(), password };
    const { data, error } =
      mode === "anmelden"
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp({
            ...credentials,
            options: { emailRedirectTo: `${window.location.origin}/login` },
          });
    setPending(false);

    if (error) {
      return setError(
        mode === "anmelden"
          ? "E-Mail-Adresse oder Passwort stimmen nicht."
          : "Das Konto konnte nicht angelegt werden. Das Passwort braucht mindestens 6 Zeichen.",
      );
    }
    if (!data.session) {
      // Supabase verlangt noch eine E-Mail-Bestätigung
      setMode("anmelden");
      return setNotice("Bestätige deine E-Mail-Adresse über den Link in der E-Mail und melde dich dann hier an.");
    }
    router.replace("/");
    router.refresh();
  }

  const isLogin = mode === "anmelden";

  return (
    <main className="app">
      <div className="login">
        <span className="eyebrow">Denkweise</span>
        <h1 className="page-title">Jeden Tag eine Frage. Sokrates hakt nach.</h1>

        <form onSubmit={submit} className="stack">
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
          <div className="field">
            <label htmlFor="password">Passwort</label>
            <input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn" type="submit" disabled={pending}>
            {isLogin ? "Anmelden" : "Konto anlegen"}
          </button>
          <button
            className="btn ghost"
            type="button"
            onClick={() => {
              setMode(isLogin ? "registrieren" : "anmelden");
              setError(null);
              setNotice(null);
            }}
          >
            {isLogin ? "Neu hier? Konto anlegen" : "Schon ein Konto? Anmelden"}
          </button>
        </form>
        {notice && <p className="muted" role="status">{notice}</p>}
        {error && <p className="error" role="alert">{error}</p>}
      </div>
    </main>
  );
}
