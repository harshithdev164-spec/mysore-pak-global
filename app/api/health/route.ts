export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const envOk = {
    NEXT_PUBLIC_SUPABASE_URL: url ? `${url.slice(0, 30)}…` : "MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: key ? `${key.slice(0, 20)}…` : "MISSING",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "set"
      : "MISSING",
  };

  if (!url || !key) {
    return NextResponse.json({ ok: false, env: envOk }, { status: 500 });
  }

  try {
    const supabase = createServerClient();
    const { count, error } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        { ok: false, env: envOk, dbError: error.message, hint: error.hint },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, env: envOk, productCount: count });
  } catch (e) {
    return NextResponse.json(
      { ok: false, env: envOk, exception: String(e) },
      { status: 500 }
    );
  }
}
