"use server";

import { redirect } from "next/navigation";
import { createProfileChallenge } from "@/lib/denkweise";
import { getUser } from "@/lib/supabase/server";

export async function challengeProfile() {
  const { supabase, user } = await getUser();
  if (!user) redirect("/login");
  const conversation = await createProfileChallenge(supabase, user.id);
  redirect(`/gespraech/${conversation.id}`);
}

export async function signOut() {
  const { supabase } = await getUser();
  await supabase.auth.signOut();
  redirect("/login");
}
