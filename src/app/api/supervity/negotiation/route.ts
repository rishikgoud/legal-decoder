
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    // 1. Validate Environment Variables
    if (!process.env.SUPERVITY_API_KEY || !process.env.SUPERVITY_ORG_ID || !process.env.SUPERVITY_AGENT_ID || !process.env.SUPERVITY_SKILL_ID) {
      console.error("❌ Missing Supervity environment variables");
      return NextResponse.json({ error: "Server configuration error: Missing Supervity credentials." }, { status: 500 });
    }
    
    // 2. Validate Incoming Payload
    const { contractId, userId, contractSummary } = await req.json();

    if (!contractId || !userId) {
      return NextResponse.json({ error: "Missing contractId or userId" }, { status: 400 });
    }

    if (!contractSummary || !contractSummary.summaryText || !contractSummary.clauses || contractSummary.clauses.length === 0) {
      return NextResponse.json({ error: "Missing or incomplete contract summary data" }, { status: 400 });
    }
    
    // Fetch the contract to get extracted emails
    const { data: contractData, error: dbError } = await supabaseAdmin
        .from('contract_analyses')
        .select('extracted_emails')
        .eq('id', contractId)
        .single();

    if (dbError) {
        console.error('❌ Supabase error fetching emails:', dbError);
        // We can still proceed without emails, but we log the error.
    }

    // 3. Construct the explicit input object for the agent
    const agentInput = {
      contract_id: contractId,
      user_id: userId,
      contract_summary: contractSummary.summaryText,
      overall_risk: contractSummary.overallRisk,
      risk_score: contractSummary.score,
      extractedEmails: contractData?.extracted_emails || [], // Include extracted emails
      clauses: contractSummary.clauses.map((c: any) => ({
        title: c.clauseTitle,
        text: c.clauseText,
        risk: c.riskLevel
      }))
    };

    // 4. Construct the FormData payload
    const formData = new FormData();
    formData.append('v2AgentId', process.env.SUPERVITY_AGENT_ID!);
    formData.append('v2SkillId', process.env.SUPERVITY_SKILL_ID!);

    // Convert the JSON input object to a buffer and append as a file
    const inputBuffer = Buffer.from(JSON.stringify(agentInput), 'utf-8');
    const blob = new Blob([inputBuffer], { type: 'text/plain' });
    formData.append('inputFiles', blob, 'inputpayload.txt');

    console.log("🚀 Sending FormData to Supervity with inputpayload.txt...");
    console.log("📋 Payload Content:", JSON.stringify(agentInput, null, 2));


    // 5. Call the Supervity API
    const response = await fetch("https://api.supervity.ai/botapi/draftSkills/v2/execute/", {
      method: "POST",
      headers: {
        'x-api-token': process.env.SUPERVITY_API_KEY!,
        'x-api-org': process.env.SUPERVITY_ORG_ID!,
        // Do NOT set Content-Type, fetch does it automatically for FormData
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Supervity API Error:", response.status, result);
      throw new Error(result.message || `Supervity API failed with status ${response.status}`);
    }

    console.log("✅ Supervity agent executed successfully:", result);
    return NextResponse.json({ success: true, data: result });

  } catch (err: any) {
    console.error("❌ Negotiation API failed:", err.message);
    return NextResponse.json(
      { error: "Failed to execute negotiation agent.", details: err.message },
      { status: 500 }
    );
  }
}
