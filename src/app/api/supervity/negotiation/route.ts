
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { SUPERVITY_AGENT_ID, SUPERVITY_SKILL_ID, SUPERVITY_API_TOKEN, SUPERVITY_ORG_ID } = process.env;
    if (!SUPERVITY_AGENT_ID || !SUPERVITY_SKILL_ID || !SUPERVITY_API_TOKEN || !SUPERVITY_ORG_ID) {
      console.error('❌ Supervity environment variables are not fully configured.');
      return NextResponse.json({ error: 'Negotiation agent is not configured on the server.' }, { status: 500 });
    }
    
    console.log("🔥 NEGOTIATION API HIT");

    const { contractId } = await req.json();
    console.log("📦 Incoming body:", { contractId });

    if (!contractId) {
        return NextResponse.json({ error: "Missing contractId" }, { status: 400 });
    }

    // 1️⃣ FETCH ANALYSIS DATA
    console.log(`🔎 Fetching analysis for contractId: ${contractId}`);
    const { data: contract, error: contractError } = await supabaseAdmin
      .from("contract_analyses")
      .select("*")
      .eq("id", contractId)
      .single();

    if (contractError || !contract) {
        console.error('❌ Contract fetch error:', contractError);
        return NextResponse.json({ error: 'Contract not found or unauthorized' }, { status: 404 });
    }
    console.log("✅ Analysis fetched successfully.");
    
    if (!contract.analysis_data || typeof contract.analysis_data !== 'object' || ('error' in (contract.analysis_data as object)) || !Array.isArray(contract.analysis_data)) {
        console.error('❌ Contract analysis data is missing or invalid.');
        return NextResponse.json({ error: 'Contract analysis data is missing or invalid.' }, { status: 422 });
    }

    // 2️⃣ BUILD FLAT INPUT (CRITICAL)
    const clauses: any[] = contract.analysis_data;
    const contractText = clauses.map(c => c.clauseText).join("\n\n");
    const clauseTitles = clauses.map(c => c.clauseType).join(", ");
    const clauseTexts = clauses.map(c => c.summary).join("\n\n");

    const agentInput = {
      contract_name: contract.file_name,
      risk_level: contract.risk_level,
      risk_summary: `This contract has an overall risk level of ${contract.risk_level}. Key areas of concern include clauses related to ${clauseTitles}.`,
      contract_text: contractText.slice(0, 18000), // Safety slicing
      clause_titles: clauseTitles,
      clause_texts: clauseTexts
    };
    
    if (!agentInput.contract_text || !agentInput.clause_titles) {
      throw new Error("Failed to construct a valid input payload from analysis data.");
    }
    
    const supervityPayload = {
      v2AgentId: SUPERVITY_AGENT_ID,
      v2SkillId: SUPERVITY_SKILL_ID,
      inputText: JSON.stringify(agentInput),
    };
    
    // 3️⃣ Log payload
    console.log("🚀 AGENT INPUT PAYLOAD (stringified for inputText):", supervityPayload.inputText);

    // 4️⃣ CALL SUPERVITY
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

    const resultText = await response.text();
    console.log("📄 Supervity API Response Text:", resultText);

    if (!response.ok) {
      console.error('❌ Supervity API Error Response:', resultText);
      throw new Error(`Supervity API failed with status: ${response.status}. Details: ${resultText}`);
    }
    
    let result;
    try {
      result = JSON.parse(resultText);
    } catch(e) {
      throw new Error(`Failed to parse Supervity JSON response: ${resultText}`);
    }

    console.log("✅ Supervity workflow triggered successfully. Run ID:", result.runId);

    // 5️⃣ Log successful trigger
    await supabaseAdmin.from('negotiation_actions').insert({
      contract_id: contractId,
      user_id: contract.user_id,
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
