# Denkweise

Jeden Tag eine philosophische Frage. Du antwortest, Sokrates hakt nach, und nach drei Antworten wird dein Gedankengang einer Denkschule zugeordnet, mit einem Sachbuch zum Verstehen und einem Roman, der dieses Denken als Geschichte erzählt.

Die App merkt sich deine Antworten und schreibt daraus ein philosophisches Profil fort: Überzeugungen, Spannungen und offene Fäden. Ab dem dritten Gespräch entstehen die Tagesfragen aus diesem Profil, und unter „Profil“ kannst du Sokrates bitten, deine stärkste Überzeugung anzugreifen.

**Technik:** Next.js 16 (App Router) als installierbare Web-App auf Vercel, Supabase für Anmeldung und Datenbank, Claude API für den Dialog.

## Aufbau

| Bereich | Datei |
|---|---|
| Datenbankschema mit Row Level Security | `supabase/migrations/20261026000000_init.sql` |
| Denkschulen, geprüfte Bücher, 30 Startfragen | `supabase/seed.sql` |
| Ablauf: Tagesfrage, Dialog, Einordnung, Profil | `src/lib/denkweise.ts` |
| Prompts für Sokrates, Einordnung, Profil, Fragen | `src/lib/prompts.ts` |
| Claude-Aufrufe | `src/lib/claude.ts` |
| Screens | `src/app/` (Heute, Tagebuch, Profil, Anmeldung) |

Buchempfehlungen kommen nur aus dem Katalog in `supabase/seed.sql`. Claude wählt per strukturierter Ausgabe eine Buch-ID daraus, kann also keine Titel erfinden. Neue Bücher oder Denkschulen trägst du einfach dort ein.

## Einrichtung

### 1. Supabase

1. Neues Projekt auf [supabase.com](https://supabase.com) anlegen.
2. Im SQL-Editor zuerst `supabase/migrations/20261026000000_init.sql`, dann `supabase/seed.sql` ausführen (oder `supabase db push` und `supabase db seed` mit der CLI).
3. **Authentication → URL Configuration**: Als Site URL die Vercel-Adresse eintragen (z. B. `https://denkweise-vale-efe3.vercel.app`), damit der Bestätigungslink nach der Registrierung zurück zur App führt.
   Angemeldet wird mit E-Mail und Passwort direkt in der App. Ein Login-Link aus einer E-Mail würde auf dem iPhone nur Safari anmelden, nicht die App auf dem Home-Bildschirm, weil diese eigene Cookies hat.
   Tipp: Wenn dein Konto angelegt ist, kannst du unter **Authentication → Sign In / Providers** „Allow new users to sign up“ ausschalten, damit niemand sonst die App (und deinen Claude-API-Schlüssel) nutzt.
4. Unter **Project Settings → API** die Projekt-URL und den Publishable Key kopieren.

### 2. Claude API

In der [Claude Console](https://console.anthropic.com) einen API-Schlüssel anlegen. Standardmodell ist `claude-opus-5-5`; über `CLAUDE_MODEL` lässt sich z. B. auf `claude-sonnet-5-5` wechseln, wenn es günstiger sein soll.

### 3. Lokal starten

```bash
cp .env.example .env.local   # Werte eintragen
npm install
npm run dev
```

### 4. Vercel

Repository in Vercel importieren und die Umgebungsvariablen aus `.env.example` setzen. `ANTHROPIC_API_KEY` bleibt serverseitig und darf nie mit `NEXT_PUBLIC_` beginnen.

### 5. Aufs iPhone

Die Vercel-Adresse in Safari öffnen, Teilen-Symbol, **Zum Home-Bildschirm**. Danach startet Denkweise wie eine eigene App im Vollbild.

## Umgebungsvariablen

| Name | Pflicht | Zweck |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ja | Supabase-Projekt-URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ja | Öffentlicher Supabase-Schlüssel |
| `ANTHROPIC_API_KEY` | ja | Claude API, nur serverseitig |
| `CLAUDE_MODEL` | nein | Standard `claude-opus-5-5` |
| `APP_TIMEZONE` | nein | Wann ein neuer Tag beginnt, Standard `Europe/Vienna` |
| `DIALOG_ROUNDS` | nein | Antworten bis zur Einordnung, Standard `3` |

## Nächste Schritte

- Tägliche Push-Erinnerung (Web Push funktioniert auf dem iPhone ab iOS 16.4 für Apps auf dem Home-Bildschirm)
- Leseliste: Bücher merken und als gelesen markieren
- Nach einem Jahr dieselbe Frage erneut stellen und die Antworten vergleichen
- Antworten von Sokrates live Wort für Wort anzeigen (Streaming)
