import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { auditId, email, companyName, role } = body;

  // Honeypot check — if bot filled the hidden field, reject silently
  if (body.website) {
    return NextResponse.json({ success: true });
  }

  const { error } = await supabase
    .from("audits")
    .update({
      email,
      company_name: companyName,
      role,
    })
    .eq("id", auditId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}