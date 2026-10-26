import Link from "next/link";
import { redirect } from "next/navigation";
import { TabBar } from "@/components/TabBar";
import { getUser } from "@/lib/supabase/server";

const fmt = new Intl.DateTimeFormat("de-AT", { day: "numeric", month: "short", year: "numeric" });

type Row = {
  id: string;
  question_text: string;
  kind: "taeglich" | "profil";
  day: string;
  status: string;
  classifications: { schools: { name: string } | null } | null;
};

export default async function Tagebuch() {
  const { supabase, user } = await getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("conversations")
    .select("id, question_text, kind, day, status, classifications(schools(name))")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as unknown as Row[];

  return (
    <main className="app">
      <span className="eyebrow">Tagebuch</span>
      <h1 className="page-title">Was du bisher gedacht hast</h1>
      {rows.length === 0 ? (
        <p className="muted">Hier erscheinen deine Gespräche, sobald du die erste Frage beantwortet hast.</p>
      ) : (
        <ul className="list">
          {rows.map((row) => (
            <li key={row.id}>
              <Link href={`/gespraech/${row.id}`}>
                <span className="meta">
                  <span>{fmt.format(new Date(row.day))}</span>
                  {row.kind === "profil" && <span>Profil-Herausforderung</span>}
                  {row.classifications?.schools ? (
                    <span className="tag">{row.classifications.schools.name}</span>
                  ) : (
                    <span>offen</span>
                  )}
                </span>
                <span className="q">{row.question_text}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <TabBar active="/tagebuch" />
    </main>
  );
}
