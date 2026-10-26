-- Denkweise: Grundschema
-- Kuratierte Inhalte (Denkschulen, Bücher, Fragen) sind für alle angemeldeten Nutzer lesbar.
-- Alles Persönliche (Gespräche, Nachrichten, Einordnungen, Profil) sieht nur die jeweilige Person.

-- ───────────── Kuratierte Inhalte ─────────────

create table public.schools (
  slug text primary key,
  name text not null,
  summary text not null,
  thinkers text[] not null default '{}'
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  school_slug text not null references public.schools (slug) on delete cascade,
  title text not null,
  author text not null,
  kind text not null check (kind in ('sachbuch', 'roman')),
  blurb text not null,
  unique (school_slug, title)
);
create index books_school_idx on public.books (school_slug);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  theme text not null,
  source_hint text,
  origin text not null default 'kuratiert' check (origin in ('kuratiert', 'generiert')),
  -- Nur bei generierten Fragen gesetzt: für wen die Frage erzeugt wurde
  user_id uuid references auth.users (id) on delete cascade,
  rationale text,
  created_at timestamptz not null default now(),
  check ((origin = 'kuratiert') = (user_id is null))
);
create index questions_user_idx on public.questions (user_id);
create unique index questions_curated_text_idx on public.questions (text) where origin = 'kuratiert';

-- ───────────── Persönliche Daten ─────────────

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  question_id uuid references public.questions (id) on delete set null,
  question_text text not null,
  kind text not null default 'taeglich' check (kind in ('taeglich', 'profil')),
  day date not null,
  status text not null default 'offen' check (status in ('offen', 'eingeordnet')),
  created_at timestamptz not null default now()
);
-- Pro Tag genau eine tägliche Frage
create unique index conversations_daily_idx on public.conversations (user_id, day) where kind = 'taeglich';
create index conversations_user_idx on public.conversations (user_id, created_at desc);

create table public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  role text not null check (role in ('nutzer', 'sokrates')),
  content text not null,
  created_at timestamptz not null default now()
);
create index messages_conversation_idx on public.messages (conversation_id, id);

create table public.classifications (
  conversation_id uuid primary key references public.conversations (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  school_slug text not null references public.schools (slug),
  confidence int not null check (confidence between 0 and 100),
  explanation text not null,
  -- [{ "school_slug": "...", "score": 0-100 }]
  scores jsonb not null default '[]',
  book_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);
create index classifications_user_idx on public.classifications (user_id, created_at desc);

-- Das philosophische Profil wird nach jedem Gespräch von Claude fortgeschrieben.
create table public.profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  summary text not null default '',
  -- [{ "claim": "...", "strength": 1-5, "evidence": "..." }]
  beliefs jsonb not null default '[]',
  -- [{ "between": "...", "description": "..." }]
  tensions jsonb not null default '[]',
  -- Offene Fäden, aus denen neue Fragen entstehen: ["..."]
  open_threads jsonb not null default '[]',
  -- { "<school_slug>": <anzahl> }
  school_tally jsonb not null default '{}',
  conversation_count int not null default 0,
  updated_at timestamptz not null default now()
);

-- ───────────── Row Level Security ─────────────

alter table public.schools enable row level security;
alter table public.books enable row level security;
alter table public.questions enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.classifications enable row level security;
alter table public.profiles enable row level security;

create policy "Denkschulen lesbar" on public.schools
  for select to authenticated using (true);

create policy "Bücher lesbar" on public.books
  for select to authenticated using (true);

create policy "Kuratierte und eigene Fragen lesbar" on public.questions
  for select to authenticated
  using (origin = 'kuratiert' or user_id = (select auth.uid()));

create policy "Eigene generierte Fragen anlegen" on public.questions
  for insert to authenticated
  with check (origin = 'generiert' and user_id = (select auth.uid()));

create policy "Eigene Gespräche" on public.conversations
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Eigene Nachrichten" on public.messages
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = (select auth.uid())
    )
  );

create policy "Eigene Einordnungen" on public.classifications
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Eigenes Profil" on public.profiles
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
