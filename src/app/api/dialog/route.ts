import { after, NextResponse } from "next/server";
import { z } from "zod";
import { ClaudeRefusalError } from "@/lib/claude";
import { respond } from "@/lib/denkweise";
import { getUser } from "@/lib/supabase/server";

export const maxDuration = 120;

const Body = z.object({
  conversationId: z.uuid(),
  text: z.string().trim().min(1).max(4000),
});

export async function POST(request: Request) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Deine Antwort ist leer oder zu lang." }, { status: 400 });
  }

  try {
    const { result, followUp } = await respond(supabase, user.id, parsed.data.conversationId, parsed.data.text);
    if (followUp) after(followUp);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    const message =
      err instanceof ClaudeRefusalError
        ? "Sokrates kann auf diese Antwort nicht eingehen. Formuliere sie bitte anders."
        : "Sokrates ist gerade nicht erreichbar. Versuch es in einem Moment noch einmal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
