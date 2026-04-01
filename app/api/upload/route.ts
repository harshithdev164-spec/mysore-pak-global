export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

const BUCKET = "product-images";
// 4 MB — kept under Vercel's 4.5 MB infrastructure limit so the route handler
// always receives the request and can return a proper JSON error.
const MAX_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 4 MB" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = createAdminClient();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      // Common cause: bucket RLS or missing service role key
      const hint =
        uploadError.message.includes("row-level security") ||
        uploadError.message.includes("policy")
          ? " (Check: SUPABASE_SERVICE_ROLE_KEY env var and bucket RLS policies)"
          : "";
      return NextResponse.json(
        { error: uploadError.message + hint },
        { status: 500 }
      );
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);

    // Verify the URL is publicly reachable before saving it to the DB.
    // If the bucket is not set to "public" in Supabase, this will catch it early.
    try {
      const check = await fetch(data.publicUrl, { method: "HEAD" });
      if (!check.ok) {
        // Clean up the orphaned file
        await supabase.storage.from(BUCKET).remove([filename]);
        console.error("Uploaded file URL not publicly accessible:", data.publicUrl, check.status);
        return NextResponse.json(
          {
            error:
              `Image uploaded but the URL is not publicly accessible (HTTP ${check.status}). ` +
              "Ensure the 'product-images' bucket is set to Public in Supabase → Storage.",
          },
          { status: 500 }
        );
      }
    } catch {
      // Network error during verification — don't block; URL might still work in browser
      console.warn("Could not verify image URL accessibility — proceeding anyway");
    }

    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
