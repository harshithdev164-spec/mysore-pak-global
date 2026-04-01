export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

const BUCKET = "product-images";
const MAX_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function fileNameToSlug(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, "")      // remove extension
    .toLowerCase()
    .replace(/\s+/g, "-")          // spaces → hyphens
    .replace(/[^a-z0-9-]/g, "")   // strip special chars
    .replace(/-+/g, "-")           // collapse multiple hyphens
    .replace(/^-|-$/g, "");        // trim leading/trailing hyphens
}

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  // Fetch all products once
  const { data: products, error: fetchError } = await supabase
    .from("products")
    .select("id, name, slug");

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const results = await Promise.all(
    files.map(async (file) => {
      const slug = fileNameToSlug(file.name);
      const originalName = file.name;

      // Match by slug first, then by normalized name
      const product = products?.find(
        (p) =>
          p.slug === slug ||
          p.slug === slug.replace(/-/g, "") ||
          fileNameToSlug(p.name) === slug
      );

      if (!product) {
        return { file: originalName, slug, status: "no_match" as const, message: "No product found for this filename" };
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return { file: originalName, slug, product: product.name, status: "error" as const, message: "Invalid file type" };
      }

      if (file.size > MAX_SIZE) {
        return { file: originalName, slug, product: product.name, status: "error" as const, message: "File exceeds 4 MB limit" };
      }

      try {
        const ext = file.name.split(".").pop() ?? "jpg";
        const filename = `${slug}-${Date.now()}.${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(filename, buffer, { contentType: file.type, upsert: true });

        if (uploadError) throw new Error(uploadError.message);

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
        const publicUrl = urlData.publicUrl;

        const { error: updateError } = await supabase
          .from("products")
          .update({ image: publicUrl })
          .eq("id", product.id);

        if (updateError) throw new Error(updateError.message);

        return { file: originalName, slug, product: product.name, status: "success" as const, url: publicUrl };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { file: originalName, slug, product: product.name, status: "error" as const, message };
      }
    })
  );

  const summary = {
    total: results.length,
    success: results.filter((r) => r.status === "success").length,
    no_match: results.filter((r) => r.status === "no_match").length,
    error: results.filter((r) => r.status === "error").length,
  };

  return NextResponse.json({ summary, results });
}
