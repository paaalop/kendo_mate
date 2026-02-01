"use server";

import { createClient } from "@/utils/supabase/server";
import { checkOwnerRole } from "@/lib/utils/auth";
import { revalidatePath } from "next/cache";
import { Session, CurriculumItem } from "@/lib/types/admin";

// --- Dojo Profile ---

export async function updateDojoProfile(name: string) {
  await checkOwnerRole();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("dojo_id")
    .eq("user_id", user.id)
    .single();

  if (!profile?.dojo_id) throw new Error("No Dojo found");

  const { error } = await supabase
    .from("dojos")
    .update({ name })
    .eq("id", profile.dojo_id);

  if (error) throw new Error("Failed to update dojo");
  
  revalidatePath("/settings");
  revalidatePath("/", "layout"); 
}

// --- Sessions ---

export async function getSessionList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("dojo_id")
    .eq("user_id", user.id)
    .single();

  if (!profile?.dojo_id) return [];

  const { data } = await supabase
    .from("sessions")
    .select("*")
    .eq("dojo_id", profile.dojo_id)
    .order("start_time");

  return data || [];
}

export async function manageSession(action: 'create' | 'update' | 'delete', data: Partial<Session>) {
  await checkOwnerRole();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("dojo_id")
    .eq("user_id", user!.id)
    .single();

  if (!profile?.dojo_id) throw new Error("No Dojo found");

  if (action === 'create') {
    if (!data.name || !data.start_time || !data.end_time) {
      throw new Error("Missing required fields for session creation");
    }
    const { error } = await supabase.from("sessions").insert({
      name: data.name,
      start_time: data.start_time,
      end_time: data.end_time,
      dojo_id: profile.dojo_id
    });
    if (error) throw error;
  } else if (action === 'update') {
    const { id, ...updateData } = data;
    if (!id) throw new Error("ID required for update");
    const { error } = await supabase.from("sessions").update(updateData).eq("id", id);
    if (error) throw error;
  } else if (action === 'delete') {
    if (!data.id) throw new Error("ID required for delete");
    const { error } = await supabase.from("sessions").delete().eq("id", data.id);
    if (error) throw error;
  }

  revalidatePath("/settings");
}

// --- Curriculum ---

export async function getCurriculumList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("dojo_id")
    .eq("user_id", user.id)
    .single();

  if (!profile?.dojo_id) return [];

  const { data } = await supabase
    .from("curriculum_items")
    .select("*")
    .eq("dojo_id", profile.dojo_id)
    .order("order_index");

  return data || [];
}

export async function manageCurriculumItem(action: 'create' | 'update' | 'delete', data: Partial<CurriculumItem>) {
  await checkOwnerRole();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("dojo_id")
    .eq("user_id", user!.id)
    .single();

  if (!profile?.dojo_id) throw new Error("No Dojo found");

  if (action === 'create') {
    const { count } = await supabase
      .from("curriculum_items")
      .select("*", { count: 'exact', head: true })
      .eq("dojo_id", profile.dojo_id);
    
    if (!data.title) {
      throw new Error("Missing required fields for curriculum item creation");
    }

    const { error } = await supabase.from("curriculum_items").insert({
      ...data,
      title: data.title,
      dojo_id: profile.dojo_id,
      order_index: (count || 0) + 1
    });
    if (error) throw error;
  } else if (action === 'update') {
    const { id, ...updateData } = data;
    if (!id) throw new Error("ID required for update");
    const { error } = await supabase.from("curriculum_items").update(updateData).eq("id", id);
    if (error) throw error;
  } else if (action === 'delete') {
    if (!data.id) throw new Error("ID required for delete");
    const { error } = await supabase.from("curriculum_items").delete().eq("id", data.id);
    if (error) throw error;
  }

  revalidatePath("/settings");
}

export async function reorderCurriculumItem(itemId: string, newIndex: number) {
  await checkOwnerRole();
  const supabase = await createClient();
  
  const { error } = await supabase.rpc('reorder_curriculum_item', {
    target_item_id: itemId,
    new_index: newIndex
  });

  if (error) throw error;
  
  revalidatePath("/settings");
}
