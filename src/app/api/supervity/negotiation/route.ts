
import {NextResponse} from 'next/server';
import {supabaseAdmin} from '@/lib/supabaseAdmin';
import type {DetectAndLabelClausesOutput} from '@/ai/schemas/detect-and-label-clauses-schema';

export async function POST(req: Request) {
  const {userId, contractId } = await req.json();

  if (!userId || !contractId) {
    return NextResponse.json({error: 'Missing userId or contractId'}, {status: 400});
  }

  // Verify all required environment variables are present.
  const { SUPERVITY_AGENT_ID, SUPERVITY_SKILL_ID, SUPERVITY_API_TOKEN, SUPERVITY_ORG_ID } = process.env;
  if (!SUPERVITY_AGENT_ID || !SUPERVITY_SKILL_ID || !SUPERVITY_API_TOKEN || !SUPERVITY_ORG_ID) {
    console.error("Supervity environment variables are not fully configured.");
    return NextResponse.json({ error: "Negotiation agent is not configured on the server." }, { status: 500 });
  }

  // 1. Fetch the full analysis data from the database
  const {data: contract, error: contractError} = await supabaseAdmin
    .from('contract_analyses')
    .select('*')
    .eq('id', contractId)
    .eq('user_id', userId)
    .single();

  if (contractError || !contract) {
    console.error("Contract fetch error:", contractError);
    return NextResponse.json({error: 'Unauthorized or contract not found'}, {status: 403});
  }

  // Ensure analysis_data is valid
  if (!contract.analysis_data || typeof contract.analysis_data !== 'object' || 'error' in contract.analysis_data) {
     return NextResponse.json({error: 'Contract analysis data is missing or invalid.'}, {status: 400});
  }
  
  // Reconstruct the full text from the clause data if not stored separately
  const contractText = (contract.analysis_data as DetectAndLabelClausesOutput).map(c => c.clauseText).join('\n\n');

  // 2. Construct a rich input object for the agent.
  const agentInput = {
    contract: {
      id: contractId,
      title: contract.file_name,
      text: contractText,
    },
    analysis: {
      riskLevel: contract.risk_level,
      clauses: contract.analysis_data
    },
    userApproval: true,
  };
  
  console.log("🚀 AGENT INPUT PAYLOAD:", JSON.stringify(agentInput, null, 2));

  const supervityPayload = {
    v2AgentId: SUPERVITY_AGENT_ID,
    v2SkillId: SUPERVITY_SKILL_ID,
    // Supervity expects `input` to be a structured object.
    input: agentInput,
  };

  try {
    const response = await fetch('https://api.supervity.ai/v2/agents/run', { // Using the correct v2 run endpoint
      method: 'POST',
      headers: {
        'x-api-token': SUPERVITY_API_TOKEN,
        'x-api-org': SUPERVITY_ORG_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supervityPayload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Supervity API Error Response:", errorBody);
        throw new Error(`Supervity API failed with status: ${response.status}. Body: ${errorBody}`);
    }

    const result = await response.json();
    
    // Log the successful trigger action to the database for auditing.
    await supabaseAdmin.from('negotiation_actions').insert({
        contract_id: contractId,
        user_id: userId,
        status: 'running',
        supervity_run_id: result.runId || null,
    });

    return NextResponse.json({success: true, data: result});

  } catch (error: any) {
    console.error('Error calling Supervity agent:', error.message);
    // Log the failure to the database.
    await supabaseAdmin.from('negotiation_actions').insert({
        contract_id: contractId,
        user_id: userId,
        status: 'failed',
    });
    return NextResponse.json(
      {error: 'Failed to execute negotiation agent.', details: error.message},
      {status: 500}
    );
  }
}
