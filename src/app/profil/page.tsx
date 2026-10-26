import { redirect } from "next/navigation";
import { TabBar } from "@/components/TabBar";
import { getCatalog, getProfile } from "@/lib/denkweise";
import { getUser } from "@/lib/supabase/server";
import { challengeProfile, signOut } from "./actions";

export const dynamic = "force-dynamic";

export default async function Profil() {
  const { supabase, user } = await getUser();
  if (!user) redirect("/login");

  const [profile, { schools }] = await Promise.all([getProfile(supabase, user.id), getCatalog(supabase)]);
  const names = new Map(schools.map((s) => [s.slug, s.name]));

  if (!profile) {
    return (
      <main className="app">
        <span className="eyebrow">Dein philosophisches Profil</span>
        <div className="empty">
          <h1 className="page-title">Noch ein leeres Blatt</h1>
          <p className="muted">
            Nach deinem ersten abgeschlossenen Gespräch entsteht hier ein Bild davon, wie du denkst. Es wächst mit
            jeder Frage, und ab dem dritten Gespräch entstehen deine Tagesfragen daraus.
          </p>
        </div>
        <TabBar active="/profil" />
      </main>
    );
  }

  const tally = Object.entries(profile.school_tally).sort((a, b) => b[1] - a[1]);
  const max = tally[0]?.[1] ?? 1;

  return (
    <main className="app">
      <span className="eyebrow">Dein philosophisches Profil · {profile.conversation_count} Gespräche</span>
      <p className="explain" style={{ margin: 0 }}>{profile.summary}</p>

      <form action={challengeProfile}>
        <button className="btn" type="submit">Profil herausfordern</button>
      </form>

      {tally.length > 0 && (
        <section className="card">
          <h2>Wiederkehrende Denkschulen</h2>
          <div className="meter">
            {tally.map(([slug, count]) => (
              <div key={slug}>
                <span>{names.get(slug) ?? slug}</span>
                <span className="bar" style={{ "--w": `${(count / max) * 100}%` } as React.CSSProperties} />
                <span>{count}×</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {profile.beliefs.length > 0 && (
        <section className="card">
          <h2>Deine Überzeugungen</h2>
          <ul>
            {profile.beliefs.map((b, i) => (
              <li key={i}>
                <span className="strength" aria-label={`Stärke ${b.strength} von 5`}>
                  {"●".repeat(b.strength)}{"○".repeat(5 - b.strength)}
                </span>
                <div>{b.claim}</div>
                <div className="muted" style={{ fontSize: 13 }}>{b.evidence}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {profile.tensions.length > 0 && (
        <section className="card">
          <h2>Spannungen in deinem Denken</h2>
          <ul>
            {profile.tensions.map((t, i) => (
              <li key={i}>
                <div>{t.between}</div>
                <div className="muted" style={{ fontSize: 13 }}>{t.description}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {profile.open_threads.length > 0 && (
        <section className="card">
          <h2>Offene Fäden</h2>
          <ul>
            {profile.open_threads.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </section>
      )}

      <form action={signOut}>
        <button className="btn ghost" type="submit">Abmelden</button>
      </form>
      <TabBar active="/profil" />
    </main>
  );
}
