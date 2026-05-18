import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://swhoyyqcrrnetrqntimn.supabase.co";

  // Test direct fetch to Supabase
  try {
    const res = await fetch(`${url}/rest/v1/propiedades?select=id&limit=1`, {
      headers: {
        "apikey": key || "",
        "Authorization": `Bearer ${key || ""}`,
      }
    });
    const data = await res.text();
    return NextResponse.json({
      key_set: !!key,
      key_prefix: key?.substring(0, 12),
      supabase_status: res.status,
      supabase_response: data.substring(0, 100)
    });
  } catch (e: unknown) {
    return NextResponse.json({ key_set: !!key, error: String(e) });
  }
}
