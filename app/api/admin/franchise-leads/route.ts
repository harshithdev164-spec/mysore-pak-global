export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// GET /api/admin/franchise-leads?status=new|contacted|converted|rejected
// Lists all franchise enquiries, newest first, optionally filtered by status.
// Auth enforced by the /api/admin/* middleware (admin session cookie).
export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  const supabase = createAdminClient();
  let query = supabase
    .from("franchise_leads")
    .select("id, name, email, phone, city, message, status, admin_notes, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (status && ["new", "contacted", "converted", "rejected"].includes(status)) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}
