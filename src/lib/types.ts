export type School = {
  slug: string;
  name: string;
  summary: string;
  thinkers: string[];
};

export type Book = {
  id: string;
  school_slug: string;
  title: string;
  author: string;
  kind: "sachbuch" | "roman";
  blurb: string;
};

export type Belief = { claim: string; strength: number; evidence: string };
export type Tension = { between: string; description: string };

export type Profile = {
  user_id: string;
  summary: string;
  beliefs: Belief[];
  tensions: Tension[];
  open_threads: string[];
  school_tally: Record<string, number>;
  conversation_count: number;
  updated_at: string;
};

export type Conversation = {
  id: string;
  user_id: string;
  question_id: string | null;
  question_text: string;
  kind: "taeglich" | "profil";
  day: string;
  status: "offen" | "eingeordnet";
  created_at: string;
};

export type Message = {
  id: number;
  conversation_id: string;
  role: "nutzer" | "sokrates";
  content: string;
  created_at: string;
};

export type Classification = {
  conversation_id: string;
  school_slug: string;
  confidence: number;
  explanation: string;
  scores: { school_slug: string; score: number }[];
  book_ids: string[];
  created_at: string;
};
