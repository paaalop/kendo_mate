"use server";

import { createClient } from "@/utils/supabase/server";
import { checkOwnerRole } from "@/lib/utils/auth";
import { revalidatePath } from "next/cache";

export async function getMonthlyPayments(month: string, status?: 'paid' | 'unpaid' | 'pending' | 'all') {
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

  let query = supabase
    .from("payments")
    .select(`
      id,
      user_id,
      status,
      paid_at,
      amount,
      target_month,
      profiles:user_id (
        name,
        phone
      )
    `)
    .eq("dojo_id", profile.dojo_id)
    .eq("target_month", month);

  if (status && status !== 'all') {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching payments:", error);
    throw new Error("Failed to fetch payments");
  }

  return data.map(p => ({
    id: p.id,
    user_id: p.user_id,
    status: p.status || 'unpaid',
    paid_at: p.paid_at,
    amount: p.amount,
    user_name: (p.profiles as unknown as { name: string | null })?.name || 'Unknown',
    user_phone: (p.profiles as unknown as { phone: string | null })?.phone || '',
  }));
}

export async function updatePaymentStatus(paymentId: string, status: 'paid' | 'unpaid' | 'pending') {
  await checkOwnerRole();
  const supabase = await createClient();

  const updateData: { status: 'paid' | 'unpaid' | 'pending'; paid_at?: string | null } = { status };
  if (status === 'paid') {
    updateData.paid_at = new Date().toISOString();
  } else {
    updateData.paid_at = null;
  }

  const { error } = await supabase
    .from("payments")
    .update(updateData)
    .eq("id", paymentId);

  if (error) {
    console.error("Error updating payment:", error);
    throw new Error("Failed to update payment");
  }

  revalidatePath("/payments");
}

export async function initializeMonthlyPayments(targetDate?: string) {
  await checkOwnerRole();
  const supabase = await createClient();
  
  let dateStr = targetDate;
  if (!dateStr) {
    const today = new Date();
    dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  }

  // T033: Prevent generating payments for future months
  const target = new Date(dateStr);
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  if (target > currentMonth) {
    throw new Error("미래 월의 회비 내역은 생성할 수 없습니다.");
  }

  const { error } = await supabase.rpc('generate_monthly_payments', {
    target_date: dateStr
  });

  if (error) {
    console.error("Error initializing payments:", error);
    throw new Error("Failed to initialize payments");
  }
  
  revalidatePath("/payments");
  return { success: true };
}
