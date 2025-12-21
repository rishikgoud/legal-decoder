
import {NextResponse} from 'next/server';
import {supabaseAdmin} from '@/lib/supabaseAdmin';
import type {DetectAndLabelClausesOutput} from '@/ai/schemas/detect-and-label-clauses-schema';

export async function POST(req: Request) {
  const {userId, contractId, contractText, analysisData} = await req.json();

  if (!userId || !contractId || !contractText || !analysisData) {
    return NextResponse.json({error: 'Missing required parameters'}, {status: 400});
  }

  // Verify all required environment variables are present.
  const { SUPERVITY_AGENT_ID, SUPERVITY_SKILL_ID, SUPERVITY_API_TOKEN, SUPERVITY_ORG_ID } = process.env;
  if (!SUPERVITY_AGENT_ID || !SUPERVITY_SKILL_ID || !SUPERVITY_API_TOKEN || !SUPERVITY_ORG_ID) {
    console.error("Supervity environment variables are not fully configured.");
    return NextResponse.json({ error: "Negotiation agent is not configured on the server." }, { status: 500 });
  }

  // Optional: Verify user owns the contract
  const {data: contract, error: contractError} = await supabaseAdmin
    .from('contract_analyses')
    .select('user_id')
    .eq('id', contractId)
    .single();

  if (contractError || !contract || contract.user_id !== userId) {
    return NextResponse.json({error: 'Unauthorized or contract not found'}, {status: 403});
  }

  const supervityPayload = {
    v2AgentId: SUPERVITY_AGENT_ID,
    v2SkillId: SUPERVITY_SKILL_ID,
    // Supervity expects `inputText` to be a string. We stringify the JSON object.
    inputText: JSON.stringify({
      contractId,
      contractText,
      analysis: analysisData,
    }),
  };

  try {
    const response = await fetch('https://api.supervity.ai/botapi/draftSkills/v2/execute/', {
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
    // A more robust implementation would use webhooks from Supervity to update the status upon completion.
    await supabaseAdmin.from('negotiation_actions').insert({
        contract_id: contractId,
        user_id: userId,
        status: 'running', // The agent has been triggered and is now running.
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
