import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://swhoyyqcrrnetrqntimn.supabase.co";

  if (!serviceKey) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY no configurada" }, { status: 500 });
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const results: string[] = [];

  // 1. Add metros_terreno column
  const { error: colError } = await admin.rpc("exec_sql", {
    sql: "ALTER TABLE propiedades ADD COLUMN IF NOT EXISTS metros_terreno integer DEFAULT 0;"
  });
  if (colError) {
    // Try direct query as fallback
    const { error: e2 } = await admin
      .from("propiedades")
      .select("metros_terreno")
      .limit(1);
    if (e2) results.push("⚠️ metros_terreno: " + colError.message);
    else results.push("✅ metros_terreno ya existe");
  } else {
    results.push("✅ metros_terreno añadida");
  }

  // 2. Create storage bucket
  const { error: bucketError } = await admin.storage.createBucket("propiedades", {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });
  if (bucketError && !bucketError.message.includes("already exists")) {
    results.push("⚠️ Bucket: " + bucketError.message);
  } else {
    results.push("✅ Bucket propiedades listo");
  }

  return NextResponse.json({ results });
}
