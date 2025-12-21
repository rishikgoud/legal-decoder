
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/**
 * Extracts unique email addresses from the contract summary and clauses.
 * @param contractSummary The contract summary object.
 * @returns An array of unique email strings.
 */
function extractEmails(contractSummary: any): string[] {
  if (!contractSummary) return [];

  const textToScan = [
    contractSummary.summaryText,
    ...(contractSummary.clauses?.map((c: any) => c.clauseText) || [])
  ].join(" ");

  const emails = textToScan.match(EMAIL_REGEX) || [];
  return [...new Set(emails)];
}

export async function POST(req: Request) {
  try {
    // 1. Validate Environment Variables
    if (!process.env.SUPERVITY_API_KEY || !process.env.SUPERVITY_ORG_ID || !process.env.SUPERVITY_AGENT_ID || !process.env.SUPERVITY_SKILL_ID) {
      console.error("❌ Missing Supervity environment variables");
      return NextResponse.json({ error: "Server configuration error: Missing Supervity credentials." }, { status: 500 });
    }
    
    // 2. Validate Incoming Payload
    const { contractId, userId, contractSummary } = await req.json();
    console.log("🟡 Negotiation API hit for contractId:", contractId);

    if (!contractId || !userId) {
      return NextResponse.json({ error: "Missing contractId or userId" }, { status: 400 });
    }

    if (!contractSummary || !contractSummary.summaryText || !contractSummary.clauses || contractSummary.clauses.length === 0) {
      return NextResponse.json({ error: "Missing or incomplete contract summary data" }, { status: 400 });
    }
    
    // 3. Fetch the contract from DB to get pre-extracted emails as a fallback/primary source
    const { data: contractData, error: dbError } = await supabaseAdmin
        .from('contract_analyses')
        .select('extracted_emails')
        .eq('id', contractId)
        .single();

    if (dbError) {
        console.warn('⚠️ Supabase warning fetching emails for contract:', contractId, dbError.message);
        // Do not fail; proceed with regex extraction.
    }

    // 4. Extract emails from the payload and combine with DB emails
    const emailsFromPayload = extractEmails(contractSummary);
    const emailsFromDb = contractData?.extracted_emails || [];
    const allEmails = [...new Set([...emailsFromDb, ...emailsFromPayload])];

    const finalExtractedEmails = allEmails.length > 0 ? allEmails : ["NO_EMAIL_FOUND"];

    // 5. Construct the explicit input object for the agent
    const agentInput = {
      contract_id: contractId,
      user_id: userId,
      contract_summary: contractSummary.summaryText,
      overall_risk: contractSummary.overallRisk,
      risk_score: contractSummary.score,
      extractedEmails: finalExtractedEmails, // Use the final combined list
      clauses: contractSummary.clauses.map((c: any) => ({
        title: c.clauseTitle,
        text: c.clauseText,
        risk: c.riskLevel
      }))
    };

    // 6. Construct the FormData payload for Supervity v2 API
    const formData = new FormData();
    formData.append('v2AgentId', process.env.SUPERVITY_AGENT_ID!);
    formData.append('v2SkillId', process.env.SUPERVITY_SKILL_ID!);

    // Convert the JSON input object to a buffer and append as a file named 'inputpayload.txt'
    const inputBuffer = Buffer.from(JSON.stringify(agentInput), 'utf-8');
    const blob = new Blob([inputBuffer], { type: 'text/plain' });
    formData.append('inputFiles', blob, 'inputpayload.txt');

    console.log("🚀 Sending FormData to Supervity...");
    console.log("📋 Payload Content to be sent in inputpayload.txt:", JSON.stringify(agentInput, null, 2));

    // 7. Call the Supervity API
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
