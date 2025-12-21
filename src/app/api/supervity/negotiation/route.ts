
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { contractId, userId, contractSummary } = await req.json();

    if (!process.env.SUPERVITY_API_KEY || !process.env.SUPERVITY_ORG_ID || !process.env.SUPERVITY_AGENT_ID || !process.env.SUPERVITY_SKILL_ID) {
      console.error("❌ Missing Supervity environment variables");
      return NextResponse.json({ error: "Server configuration error: Missing Supervity credentials." }, { status: 500 });
    }
    
    if (!contractId || !userId) {
      return NextResponse.json({ error: "Missing contractId or userId" }, { status: 400 });
    }

    if (!contractSummary || !contractSummary.summaryText || !contractSummary.clauses) {
      return NextResponse.json({ error: "Missing contract summary data" }, { status: 400 });
    }
    
    // Construct the payload for Supervity
    const agentInput = {
      contract_name: contractSummary.clauses.map((c:any) => c.clauseTitle).join(', '), // Create a name from clause titles
      risk_level: contractSummary.overallRisk,
      risk_summary: contractSummary.summaryText,
      contract_text: contractSummary.clauses.map((c: any) => c.clauseText).join("\n\n"),
      clauses: contractSummary.clauses,
    };

    const supervityPayload = {
      v2AgentId: process.env.SUPERVITY_AGENT_ID,
      v2SkillId: process.env.SUPERVITY_SKILL_ID,
      inputText: JSON.stringify(agentInput),
    };

    console.log("🚀 Sending to Supervity:", JSON.stringify(supervityPayload, null, 2));

    const response = await fetch("https://api.supervity.ai/botapi/draftSkills/v2/execute/", {
      method: "POST",
      headers: {
        'x-api-token': process.env.SUPERVITY_API_KEY!,
        'x-api-org': process.env.SUPERVITY_ORG_ID!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supervityPayload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("❌ Supervity API Error:", response.status, errorBody);
      throw new Error(`Supervity API failed with status ${response.status}: ${errorBody}`);
    }

    const result = await response.json();
    console.log("✅ Supervity agent executed successfully:", result);
    return NextResponse.json({ success: true, data: result });

  } catch (err: any) {
    console.error("❌ Negotiation API failed:", err.message);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
