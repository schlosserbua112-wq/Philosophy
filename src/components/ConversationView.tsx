import { getCatalog, getConversation, ROUNDS } from "@/lib/denkweise";
import type { SupabaseClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Dialog } from "./Dialog";
import { Verdict } from "./Verdict";

export async function ConversationView({ db, id }: { db: SupabaseClient; id: string }) {
  const loaded = await getConversation(db, id);
  if (!loaded) notFound();
  const { conversation, messages, classification } = loaded;
  const catalog = classification ? await getCatalog(db) : null;

  return (
    <>
      <Dialog
        key={`${conversation.id}-${conversation.status}`}
        conversationId={conversation.id}
        opening={conversation.question_text}
        initialTurns={messages.map((m) => ({ role: m.role, content: m.content }))}
        rounds={ROUNDS}
        closed={conversation.status === "eingeordnet"}
      />
      {classification && catalog && (
        <Verdict classification={classification} schools={catalog.schools} books={catalog.books} />
      )}
    </>
  );
}
