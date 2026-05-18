import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://swhoyyqcrrnetrqntimn.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET /api/propiedades — list all
export async function GET() {
  const { data, error } = await adminClient()
    .from("propiedades")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/propiedades — create
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await adminClient()
    .from("propiedades")
    .insert(body)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PUT /api/propiedades — update
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...rest } = body;
  const { data, error } = await adminClient()
    .from("propiedades")
    .update(rest)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/propiedades — delete
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const { error } = await adminClient()
    .from("propiedades")
    .delete()
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
