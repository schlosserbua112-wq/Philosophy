import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { askStructured, askText } from "./claude";
import {
  challengeSystem,
  classifySystem,
  profileSystem,
  questionSystem,
  socratesSystem,
} from "./prompts";
import type { Book, Classification, Conversation, Message, Profile, School } from "./types";

export const ROUNDS = Number(process.env.DIALOG_ROUNDS ?? 3);
const TIMEZONE = process.env.APP_TIMEZONE ?? "Europe/Vienna";
// Ab so vielen eingeordneten Gesprächen entstehen die Tagesfragen aus dem Profil.
const PERSONAL_QUESTIONS_AFTER = 3;

type Db = SupabaseClient;

export function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date());
}

export async function getProfile(db: Db, userId: string) {
  const { data } = await db.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  return (data as Profile | null) ?? null;
}

export async function getCatalog(db: Db) {
  const [{ data: schools }, { data: books }] = await Promise.all([
    db.from("schools").select("*").order("name"),
    db.from("books").select("*"),
  ]);
  return { schools: (schools ?? []) as School[], books: (books ?? []) as Book[] };
}

export async function getConversation(db: Db, id: string) {
  const [{ data: conversation }, { data: messages }, { data: classification }] = await Promise.all([
    db.from("conversations").select("*").eq("id", id).maybeSingle(),
    db.from("messages").select("*").eq("conversation_id", id).order("id"),
    db.from("classifications").select("*").eq("conversation_id", id).maybeSingle(),
  ]);
  if (!conversation) return null;
  return {
    conversation: conversation as Conversation,
    messages: (messages ?? []) as Message[],
    classification: (classification as Classification | null) ?? null,
  };
}

// ───────────── Frage des Tages ─────────────

export async function getOrCreateToday(db: Db, userId: string): Promise<Conversation> {
  const day = today();
  const existing = await findDaily(db, userId, day);
  if (existing) return existing;

  const profile = await getProfile(db, userId);
  const question =
    profile && profile.conversation_count >= PERSONAL_QUESTIONS_AFTER
      ? await generateQuestion(db, userId, profile).catch((err) => {
          console.error("Persönliche Frage fehlgeschlagen, nehme kuratierte Frage", err);
          return null;
        })
      : null;
  const chosen = question ?? (await pickCuratedQuestion(db, userId, day));

  const { data, error } = await db
    .from("conversations")
    .insert({ user_id: userId, question_id: chosen.id, question_text: chosen.text, kind: "taeglich", day })
    .select()
    .single();

  if (error) {
    // Zwei Tabs gleichzeitig: Die andere Anfrage hat die Tagesfrage schon angelegt.
    const raced = await findDaily(db, userId, day);
    if (raced) return raced;
    throw error;
  }
  return data as Conversation;
}

async function findDaily(db: Db, userId: string, day: string) {
  const { data } = await db
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .eq("kind", "taeglich")
    .eq("day", day)
    .maybeSingle();
  return (data as Conversation | null) ?? null;
}

async function pickCuratedQuestion(db: Db, userId: string, day: string) {
  const [{ data: questions }, { data: used }] = await Promise.all([
    db.from("questions").select("id, text").eq("origin", "kuratiert"),
    db.from("conversations").select("question_id").eq("user_id", userId),
  ]);
  const all = questions ?? [];
  if (all.length === 0) throw new Error("Keine Fragen vorhanden. Wurde supabase/seed.sql eingespielt?");

  const usedIds = new Set((used ?? []).map((u) => u.question_id));
  const fresh = all.filter((q) => !usedIds.has(q.id));
  const pool = fresh.length > 0 ? fresh : all;
  const index = [...day].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % pool.length;
  return pool[index];
}

async function generateQuestion(db: Db, userId: string, profile: Profile) {
  const { data: past } = await db
    .from("conversations")
    .select("question_text")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(40);

  const result = await askStructured(
    questionSystem(),
    [
      {
        role: "user",
        content: `<profil>${JSON.stringify(profile)}</profil>
<bisherige_fragen>${JSON.stringify((past ?? []).map((p) => p.question_text))}</bisherige_fragen>`,
      },
    ],
    z.object({ question: z.string(), theme: z.string(), rationale: z.string() }),
    "medium",
  );

  const { data, error } = await db
    .from("questions")
    .insert({
      text: result.question,
      theme: result.theme,
      rationale: result.rationale,
      origin: "generiert",
      user_id: userId,
    })
    .select("id, text")
    .single();
  if (error) throw error;
  return data;
}

// ───────────── Profil herausfordern ─────────────

export async function createProfileChallenge(db: Db, userId: string) {
  const profile = await getProfile(db, userId);
  if (!profile || profile.conversation_count === 0) {
    throw new Error("Es gibt noch kein Profil, das man herausfordern könnte.");
  }

  const result = await askStructured(
    challengeSystem(),
    [{ role: "user", content: `<profil>${JSON.stringify(profile)}</profil>` }],
    z.object({ opening: z.string(), target: z.string() }),
    "medium",
  );

  const { data, error } = await db
    .from("conversations")
    .insert({ user_id: userId, question_text: result.opening, kind: "profil", day: today() })
    .select()
    .single();
  if (error) throw error;
  return data as Conversation;
}

// ───────────── Gespräch ─────────────

export type DialogResult = { reply: string; done: boolean };

export async function respond(db: Db, userId: string, conversationId: string, text: string) {
  const loaded = await getConversation(db, conversationId);
  if (!loaded) throw new Error("Gespräch nicht gefunden.");
  const { conversation, messages } = loaded;
  if (conversation.status === "eingeordnet") throw new Error("Dieses Gespräch ist bereits abgeschlossen.");

  const history: Message[] = [...messages, { role: "nutzer", content: text } as Message];
  const answers = history.filter((m) => m.role === "nutzer").length;
  const profile = await getProfile(db, userId);

  if (answers < ROUNDS) {
    const reply = await askText(
      socratesSystem(profile, ROUNDS),
      toClaudeTurns(conversation.question_text, history),
      "low",
    );
    await saveTurn(db, userId, conversationId, text, reply);
    return { result: { reply, done: false } satisfies DialogResult, followUp: null };
  }

  const classification = await classify(db, userId, conversation, history, profile);
  await saveTurn(db, userId, conversationId, text, classification.closing);

  // Das Profil wird nach der Antwort im Hintergrund fortgeschrieben.
  const followUp = () =>
    updateProfile(db, userId, conversation, history, classification.school_slug, profile).catch((err) =>
      console.error("Profil-Update fehlgeschlagen", err),
    );

  return { result: { reply: classification.closing, done: true } satisfies DialogResult, followUp };
}

// Antwort und Erwiderung werden erst gespeichert, wenn Claude geantwortet hat.
// So bleibt bei einem Fehler keine unbeantwortete Nachricht zurück und man kann einfach erneut senden.
async function saveTurn(db: Db, userId: string, conversationId: string, answer: string, reply: string) {
  const { error } = await db.from("messages").insert([
    { conversation_id: conversationId, user_id: userId, role: "nutzer", content: answer },
    { conversation_id: conversationId, user_id: userId, role: "sokrates", content: reply },
  ]);
  if (error) throw error;
}

function toClaudeTurns(question: string, history: Message[]): Anthropic.Beta.BetaMessageParam[] {
  const [first, ...rest] = history;
  return [
    { role: "user", content: `Sokrates fragt: „${question}“\n\nMeine Antwort: ${first.content}` },
    ...rest.map((m) => ({
      role: m.role === "nutzer" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    })),
  ];
}

function transcript(question: string, history: Message[]) {
  return [`Sokrates: ${question}`, ...history.map((m) => `${m.role === "nutzer" ? "Person" : "Sokrates"}: ${m.content}`)].join(
    "\n\n",
  );
}

async function classify(
  db: Db,
  userId: string,
  conversation: Conversation,
  history: Message[],
  profile: Profile | null,
) {
  const { schools, books } = await getCatalog(db);
  const slugs = z.enum(schools.map((s) => s.slug) as [string, ...string[]]);
  const sachbuecher = books.filter((b) => b.kind === "sachbuch").map((b) => b.id);
  const romane = books.filter((b) => b.kind === "roman").map((b) => b.id);

  const result = await askStructured(
    classifySystem(schools, books, profile),
    [{ role: "user", content: `<gespraech>\n${transcript(conversation.question_text, history)}\n</gespraech>` }],
    z.object({
      school_slug: slugs,
      confidence: z.number().int(),
      explanation: z.string(),
      scores: z.array(z.object({ school_slug: slugs, score: z.number().int() })),
      sachbuch_id: z.enum(sachbuecher as [string, ...string[]]),
      roman_id: z.enum(romane as [string, ...string[]]),
      closing: z.string(),
    }),
    "medium",
  );

  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  const { error } = await db.from("classifications").insert({
    conversation_id: conversation.id,
    user_id: userId,
    school_slug: result.school_slug,
    confidence: clamp(result.confidence),
    explanation: result.explanation,
    scores: result.scores.slice(0, 3).map((s) => ({ ...s, score: clamp(s.score) })),
    book_ids: [result.sachbuch_id, result.roman_id],
  });
  if (error) throw error;

  await db.from("conversations").update({ status: "eingeordnet" }).eq("id", conversation.id);
  return result;
}

async function updateProfile(
  db: Db,
  userId: string,
  conversation: Conversation,
  history: Message[],
  schoolSlug: string,
  profile: Profile | null,
) {
  const next = await askStructured(
    profileSystem(),
    [
      {
        role: "user",
        content: `<bisheriges_profil>${JSON.stringify(profile ?? "noch leer")}</bisheriges_profil>
<neues_gespraech einordnung="${schoolSlug}">
${transcript(conversation.question_text, history)}
</neues_gespraech>`,
      },
    ],
    z.object({
      summary: z.string(),
      beliefs: z.array(z.object({ claim: z.string(), strength: z.number().int(), evidence: z.string() })),
      tensions: z.array(z.object({ between: z.string(), description: z.string() })),
      open_threads: z.array(z.string()),
    }),
    "medium",
  );

  const tally = { ...(profile?.school_tally ?? {}) };
  tally[schoolSlug] = (tally[schoolSlug] ?? 0) + 1;

  const { error } = await db.from("profiles").upsert({
    user_id: userId,
    summary: next.summary,
    beliefs: next.beliefs.slice(0, 8).map((b) => ({ ...b, strength: Math.max(1, Math.min(5, b.strength)) })),
    tensions: next.tensions.slice(0, 5),
    open_threads: next.open_threads.slice(0, 5),
    school_tally: tally,
    conversation_count: (profile?.conversation_count ?? 0) + 1,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
