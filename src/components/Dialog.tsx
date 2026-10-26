"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Turn = { role: "nutzer" | "sokrates"; content: string };

export function Dialog({
  conversationId,
  opening,
  initialTurns,
  rounds,
  closed,
}: {
  conversationId: string;
  opening: string;
  initialTurns: Turn[];
  rounds: number;
  closed: boolean;
}) {
  const router = useRouter();
  const [turns, setTurns] = useState(initialTurns);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(closed);

  const answers = turns.filter((t) => t.role === "nutzer").length;

  async function send() {
    const text = draft.trim();
    if (!text || pending) return;
    setPending(true);
    setError(null);
    setTurns((t) => [...t, { role: "nutzer", content: text }]);
    setDraft("");

    try {
      const res = await fetch("/api/dialog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unbekannter Fehler");
      setTurns((t) => [...t, { role: "sokrates", content: data.reply }]);
      if (data.done) {
        setDone(true);
        router.refresh();
      }
    } catch (err) {
      // Antwort zurück ins Eingabefeld, damit nichts verloren geht
      setTurns((t) => t.slice(0, -1));
      setDraft(text);
      setError(err instanceof Error ? err.message : "Senden fehlgeschlagen.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="progress" aria-label={`Antwort ${Math.min(answers + 1, rounds)} von ${rounds}`}>
        {Array.from({ length: rounds }, (_, i) => (
          <i key={i} className={i < answers ? "on" : undefined} />
        ))}
        <span>{done ? "Abgeschlossen" : `Antwort ${answers + 1} von ${rounds}`}</span>
      </div>

      <div className="script">
        <div className="turn">
          <span className="speaker sokrates">Sokrates</span>
          <p className="voice opening">{opening}</p>
        </div>
        {turns.map((turn, i) =>
          turn.role === "sokrates" ? (
            <div className="turn" key={i}>
              <span className="speaker sokrates">Sokrates</span>
              <p className="voice">{turn.content}</p>
            </div>
          ) : (
            <div className="turn" key={i}>
              <span className="speaker du">Du</span>
              <p className="own">{turn.content}</p>
            </div>
          ),
        )}
        {pending && (
          <div className="turn">
            <span className="speaker sokrates">Sokrates</span>
            <span className="thinking">{answers >= rounds ? "ordnet deine Gedanken ein" : "denkt nach"}</span>
          </div>
        )}
      </div>

      {!done && (
        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label htmlFor="antwort" className="eyebrow">Deine Antwort</label>
          <textarea
            id="antwort"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Antworte in Ruhe. Es gibt keine falsche Antwort, nur ungeprüfte."
            disabled={pending}
          />
          <div className="composer-row">
            <small>{answers === rounds - 1 ? "Danach folgt die Einordnung" : " "}</small>
            <button className="btn" type="submit" disabled={pending || draft.trim().length === 0}>
              Antworten
            </button>
          </div>
          {error && <p className="error" role="alert">{error}</p>}
        </form>
      )}
    </>
  );
}
