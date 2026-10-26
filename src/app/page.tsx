import { redirect } from "next/navigation";
import { ConversationView } from "@/components/ConversationView";
import { TabBar } from "@/components/TabBar";
import { getOrCreateToday } from "@/lib/denkweise";
import { getUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const dateLabel = new Intl.DateTimeFormat("de-AT", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: process.env.APP_TIMEZONE ?? "Europe/Vienna",
});

export default async function Heute() {
  const { supabase, user } = await getUser();
  if (!user) redirect("/login");

  const conversation = await getOrCreateToday(supabase, user.id);

  return (
    <main className="app">
      <span className="eyebrow">Frage des Tages · {dateLabel.format(new Date())}</span>
      <ConversationView db={supabase} id={conversation.id} />
      <TabBar active="/" />
    </main>
  );
}
