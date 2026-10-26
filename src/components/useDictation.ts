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
  abort?(): void;
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
// Nach so vielen Millisekunden ohne neues Wort endet die Aufnahme von selbst.
const SILENCE_MS = 3500;

export function useDictation(draft: string, setDraft: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognition = useRef<Recognition | null>(null);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setSupported(getRecognition() !== null), []);
  useEffect(() => () => stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  function clearSilence() {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    silenceTimer.current = null;
  }

  function armSilence() {
    clearSilence();
    silenceTimer.current = setTimeout(stop, SILENCE_MS);
  }

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
      if (recognition.current !== rec) return;
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) finals[i] = result[0].transcript.trim();
        else interim += result[0].transcript;
      }
      const spoken = [...finals.filter(Boolean), interim.trim()].filter(Boolean).join(" ");
      setDraft([base, spoken].filter(Boolean).join(base ? " " : ""));
      armSilence();
    };
    rec.onerror = (e) => {
      if (e.error !== "aborted" && e.error !== "no-speech") {
        setError(ERRORS[e.error] ?? "Die Spracherkennung ist fehlgeschlagen.");
      }
    };
    rec.onend = () => {
      if (recognition.current === rec) finish();
    };

    recognition.current = rec;
    try {
      rec.start();
      setListening(true);
      armSilence();
    } catch {
      setError("Die Spracherkennung konnte nicht starten.");
    }
  }

  function finish() {
    clearSilence();
    recognition.current = null;
    setListening(false);
  }

  // Safari auf dem iPhone beendet die Erkennung nicht immer sofort. Deshalb wird die Oberfläche
  // gleich zurückgesetzt, späte Ergebnisse werden ignoriert, und abort() ist der Notausgang.
  function stop() {
    const rec = recognition.current;
    finish();
    if (!rec) return;
    try {
      rec.stop();
    } catch {
      /* bereits beendet */
    }
    setTimeout(() => {
      try {
        rec.abort?.();
      } catch {
        /* bereits beendet */
      }
    }, 800);
  }

  return { supported, listening, error, toggle: listening ? stop : start, stop };
}
