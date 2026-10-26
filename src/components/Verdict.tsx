import type { Book, Classification, School } from "@/lib/types";

const COVER_COLORS = ["#5b7a8c", "#9c6b3f", "#6f6a8f", "#4f7b67", "#8c5a5a"];

export function Verdict({
  classification,
  schools,
  books,
}: {
  classification: Classification;
  schools: School[];
  books: Book[];
}) {
  const bySlug = new Map(schools.map((s) => [s.slug, s]));
  const school = bySlug.get(classification.school_slug);
  const findBooks = (ids: string[]) =>
    ids.map((id) => books.find((b) => b.id === id)).filter((b): b is Book => Boolean(b));
  const picks = findBooks(classification.book_ids);
  const counterSchool = classification.counter_school_slug
    ? bySlug.get(classification.counter_school_slug)
    : undefined;
  const counterPicks = findBooks(classification.counter_book_ids ?? []);

  return (
    <section className="verdict" aria-labelledby="einordnung">
      <span className="eyebrow" id="einordnung">Dein Gedankengang heute</span>
      <p className="school-name">{school?.name ?? classification.school_slug}</p>
      {school && <p className="muted">{school.thinkers.join(" · ")}</p>}
      <p className="explain">{classification.explanation}</p>

      <div className="meter">
        {classification.scores.map((s) => (
          <div key={s.school_slug}>
            <span>{bySlug.get(s.school_slug)?.name ?? s.school_slug}</span>
            <span className="bar" style={{ "--w": `${s.score}%` } as React.CSSProperties} />
            <span>{s.score}</span>
          </div>
        ))}
      </div>

      <BookList books={picks} offset={0} />

      {counterSchool && (
        <div className="counter">
          <span className="eyebrow">Gegenperspektive</span>
          <p className="counter-name">{counterSchool.name}</p>
          {classification.counter_reason && <p className="explain">{classification.counter_reason}</p>}
          <BookList books={counterPicks} offset={2} counter />
        </div>
      )}
    </section>
  );
}

function BookList({ books, offset, counter = false }: { books: Book[]; offset: number; counter?: boolean }) {
  return (
    <div className="books">
      {books.map((book, i) => (
        <div className="book" key={book.id}>
          <span
            className="cover"
            style={{ "--c": COVER_COLORS[(i + offset) % COVER_COLORS.length] } as React.CSSProperties}
          />
          <div>
            <small>
              {book.kind === "sachbuch"
                ? counter ? "Die Gegenseite verstehen" : "Zum Verstehen"
                : counter ? "Die Gegenseite erleben" : "Als Geschichte"}
            </small>
            <strong>{book.title}</strong>
            <em>{book.author}</em>
            <p>{book.blurb}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
