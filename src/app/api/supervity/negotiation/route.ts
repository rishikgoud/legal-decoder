import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("🔥 NEGOTIATION API HIT");

    const body = await req.json();
    console.log("📦 BODY RECEIVED:", body);

    return NextResponse.json({
      ok: true,
      body
    });
  } catch (error: any) {
    console.error("❌ API CRASH:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
