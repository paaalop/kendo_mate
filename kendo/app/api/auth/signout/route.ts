import { createClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Check if a user's logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  const response = NextResponse.redirect(new URL("/login", req.url), {
    status: 302,
  });

  // Clear active_profile_id cookie
  response.cookies.delete('active_profile_id');

  revalidatePath("/", "layout");
  return response;
}
