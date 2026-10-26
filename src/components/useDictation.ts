"use client";

import { useEffect, useRef, useState } from "react";

// Minimale Typen für die Web Speech API, die nicht in allen TypeScript-DOM-Versionen enthalten sind.
type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};
type RecognitionCtor = new () => Recognition;

function getRecognition(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERRORS: Record<string, string> = {
  "not-allowed": "Bitte erlaube den Zugriff auf das Mikrofon und die Spracherkennung in den Einstellungen.",
  "service-not-allowed": "Die Spracherkennung ist auf diesem Gerät gesperrt. Nutze die Diktierfunktion der Tastatur.",
  "no-speech": "Ich habe nichts gehört. Tippe noch einmal auf das Mikrofon.",
  network: "Die Spracherkennung braucht eine Internetverbindung.",
};

/**
 * Wandelt Sprache in Text um und hängt ihn an den bestehenden Entwurf an.
 * `supported` ist false, wenn der Browser keine Spracherkennung anbietet.
 */
export function useDictation(draft: string, setDraft: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognition = useRef<Recognition | null>(null);

  useEffect(() => setSupported(getRecognition() !== null), []);
  useEffect(() => () => recognition.current?.stop(), []);

  function start() {
    const Ctor = getRecognition();
    if (!Ctor) return;
    setError(null);

    const base = draft.trimEnd();
    const finals: string[] = [];
    const rec = new Ctor();
    rec.lang = "de-DE";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) finals[i] = result[0].transcript.trim();
        else interim += result[0].transcript;
      }
      const spoken = [...finals.filter(Boolean), interim.trim()].filter(Boolean).join(" ");
      setDraft([base, spoken].filter(Boolean).join(base ? " " : ""));
    };
    rec.onerror = (e) => {
      if (e.error !== "aborted") setError(ERRORS[e.error] ?? "Die Spracherkennung ist fehlgeschlagen.");
    };
    rec.onend = () => {
      setListening(false);
      recognition.current = null;
    };

    recognition.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setError("Die Spracherkennung konnte nicht starten.");
    }
  }

  function stop() {
    recognition.current?.stop();
  }

  return { supported, listening, error, toggle: listening ? stop : start, stop };
}
