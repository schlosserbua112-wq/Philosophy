-- Gegenperspektive: eine Denkschule, die dem Gedankengang widerspricht, mit eigenen Buchvorschlägen
alter table public.classifications
  add column counter_school_slug text references public.schools (slug),
  add column counter_reason text,
  add column counter_book_ids uuid[] not null default '{}';
