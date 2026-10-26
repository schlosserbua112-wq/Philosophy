import Link from "next/link";
import { redirect } from "next/navigation";
import { ConversationView } from "@/components/ConversationView";
import { TabBar } from "@/components/TabBar";
import { getUser } from "@/lib/supabase/server";

export default async function Gespraech({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await getUser();
  if (!user) redirect("/login");

  return (
    <main className="app">
      <Link href="/tagebuch" className="eyebrow">← Tagebuch</Link>
      <ConversationView db={supabase} id={id} />
      <TabBar active="/tagebuch" />
    </main>
  );
}
