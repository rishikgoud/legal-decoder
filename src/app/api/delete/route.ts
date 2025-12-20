
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { analysisId, userId } = await req.json();

    if (!analysisId || !userId) {
      return NextResponse.json(
        { error: "Missing analysisId or userId" },
        { status: 400 }
      );
    }

    // Extra safety: delete only user's own record
    const { error } = await supabaseAdmin
      .from("contract_analyses")
      .delete()
      .eq("id", analysisId)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
