
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// This function constructs the payload for the Supervity API
// It now matches the requirements from the provided cURL command.
async function triggerSupervityAgent(analysis: any) {
  // 1. Reconstruct the full contract text from the analysis data.
  const contractText = Array.isArray(analysis.analysis_data)
    ? analysis.analysis_data.map((c: any) => c.clauseText).join("\n\n")
    : "";

  // 2. Create the rich JSON object that the agent needs.
  const agentInput = {
    contract_name: analysis.file_name,
    risk_level: analysis.risk_level,
    risk_summary: analysis.summary || "", // Ensure summary is not null
    contract_text: contractText,
    clauses: analysis.analysis_data || [], // Ensure clauses is an array
  };

  // 3. Stringify the JSON object to be sent in the 'inputText' field.
  const inputText = JSON.stringify(agentInput);

  // 4. Construct the final payload for the Supervity API.
  const supervityPayload = {
    v2AgentId: process.env.SUPERVITY_AGENT_ID,
    v2SkillId: process.env.SUPERVITY_SKILL_ID,
    inputText: inputText,
  };

  console.log("🚀 Sending to Supervity:", JSON.stringify(supervityPayload, null, 2));

  // 5. Make the API call with the correct headers and body.
  const response = await fetch("https://api.supervity.ai/botapi/draftSkills/v2/execute/", {
    method: "POST",
    headers: {
      'x-api-token': process.env.SUPERVITY_API_KEY!,
      'x-api-org': process.env.SUPERVITY_ORG_ID!,
      'Content-Type': 'application/json', // The curl for inputText uses application/json
    },
    body: JSON.stringify(supervityPayload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("❌ Supervity API Error:", response.status, errorBody);
    throw new Error(`Supervity API failed with status ${response.status}: ${errorBody}`);
  }

  return await response.json();
}

export async function POST(req: Request) {
  try {
    console.log("🔥 Negotiation agent triggered");
    
    // Validate Environment Variables
    if (!process.env.SUPERVITY_API_KEY || !process.env.SUPERVITY_ORG_ID || !process.env.SUPERVITY_AGENT_ID || !process.env.SUPERVITY_SKILL_ID) {
        console.error("❌ Missing Supervity environment variables");
        throw new Error("Server configuration error: Missing Supervity credentials.");
    }

    const { contractId, userId } = await req.json();

    if (!contractId) {
      throw new Error("contractId is required in the request body.");
    }
     if (!userId) {
      throw new Error("userId is required for authorization.");
    }

    console.log(`📄 Fetching analysis for contractId: ${contractId} and userId: ${userId}`);

    // Fetch the analysis data from Supabase, ensuring user owns the record
    const { data: analysis, error } = await supabaseAdmin
      .from("contract_analyses")
      .select("*")
      .eq("id", contractId)
      .eq("user_id", userId) // Security check
      .single();

    if (error || !analysis) {
      console.error("❌ Database Error or Not Found:", error);
      return NextResponse.json({ error: `Contract analysis not found for ID: ${contractId}` }, { status: 404 });
    }

    if (analysis.status !== 'Analyzed' || !analysis.analysis_data || !Array.isArray(analysis.analysis_data)) {
        return NextResponse.json({ error: "Contract analysis is incomplete or in an error state. Cannot start negotiation." }, { status: 422 });
    }

    console.log("✅ Analysis data fetched successfully.");
    
    const result = await triggerSupervityAgent(analysis);

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
