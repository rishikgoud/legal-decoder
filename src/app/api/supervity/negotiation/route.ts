
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { SUPERVITY_AGENT_ID, SUPERVITY_SKILL_ID, SUPERVITY_API_TOKEN, SUPERVITY_ORG_ID } = process.env;
    if (!SUPERVITY_AGENT_ID || !SUPERVITY_SKILL_ID || !SUPERVITY_API_TOKEN || !SUPERVITY_ORG_ID) {
      console.error('Supervity environment variables are not fully configured.');
      return NextResponse.json({ error: 'Negotiation agent is not configured on the server.' }, { status: 500 });
    }
    
    console.log("🔥 NEGOTIATION API HIT");

    const { contractId, userId } = await req.json();
    console.log("📦 Incoming body:", { contractId, userId });

    if (!userId || !contractId) {
        return NextResponse.json({ error: "Missing userId or contractId" }, { status: 400 });
    }

    // 1. Fetch analysis from DB
    console.log(`🔎 Fetching analysis for contractId: ${contractId}`);
    const { data: contract, error: contractError } = await supabaseAdmin
      .from("contract_analyses")
      .select("*")
      .eq("id", contractId)
      .eq("user_id", userId)
      .single();

    if (contractError || !contract) {
        console.error('❌ Contract fetch error:', contractError);
        return NextResponse.json({ error: 'Unauthorized or contract not found' }, { status: 403 });
    }
    console.log("✅ Analysis fetched successfully.");
    
    if (!contract.analysis_data || typeof contract.analysis_data !== 'object' || ('error' in (contract.analysis_data as object))) {
        console.error('❌ Contract analysis data is missing or invalid.');
        return NextResponse.json({ error: 'Contract analysis data is missing or invalid.' }, { status: 400 });
    }

    // 2. Build the rich input object for the agent
    const agentInput = {
      contract: {
        id: contractId,
        name: contract.file_name,
      },
      analysis: {
        riskLevel: contract.risk_level,
        clauses: contract.analysis_data,
      },
      userApproval: true,
    };
    
    console.log("🚀 AGENT INPUT PAYLOAD:", JSON.stringify(agentInput, null, 2));

    const supervityPayload = {
      v2AgentId: SUPERVITY_AGENT_ID,
      v2SkillId: SUPERVITY_SKILL_ID,
      inputText: JSON.stringify(agentInput), // Ensure the entire input object is a string
    };
    
    // 3. Trigger Supervity workflow
    console.log("📡 Triggering Supervity workflow...");
    const response = await fetch('https://api.supervity.ai/v2/agents/run', {
      method: 'POST',
      headers: {
        'x-api-token': SUPERVITY_API_TOKEN,
        'x-api-org': SUPERVITY_ORG_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supervityPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Supervity API Error Response:', result);
      throw new Error(`Supervity API failed with status: ${response.status}. Details: ${result.error?.message || 'Unknown error'}`);
    }
    console.log("✅ Supervity workflow triggered successfully. Run ID:", result.runId);

    // 4. Log successful trigger
    await supabaseAdmin.from('negotiation_actions').insert({
      contract_id: contractId,
      user_id: userId,
      status: 'running',
      supervity_run_id: result.runId || null,
    });
    console.log("📝 Logged negotiation action to database.");


    return NextResponse.json({ success: true, data: result });

  } catch (err: any) {
    console.error("❌ Negotiation API failed:", err.stack);
    return NextResponse.json(
      { error: "Failed to execute negotiation agent.", details: err.message },
      { status: 500 }
    );
  }
}
