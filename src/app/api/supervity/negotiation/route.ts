
import {NextResponse} from 'next/server';
import {supabaseAdmin} from '@/lib/supabaseAdmin';
import type {DetectAndLabelClausesOutput} from '@/ai/schemas/detect-and-label-clauses-schema';

// This is the function that was missing the 'export' keyword.
export async function POST(req: Request) {
  const {userId, contractId, contractText, analysisData} = await req.json();

  if (!userId || !contractId || !contractText || !analysisData) {
    return NextResponse.json({error: 'Missing required parameters'}, {status: 400});
  }

  // Optional: Verify user owns the contract
  const {data: contract, error: contractError} = await supabaseAdmin
    .from('contract_analyses')
    .select('user_id')
    .eq('id', contractId)
    .single();

  if (contractError || contract.user_id !== userId) {
    return NextResponse.json({error: 'Unauthorized access to contract'}, {status: 403});
  }

  const supervityPayload = {
    v2AgentId: process.env.SUPERVITY_AGENT_ID,
    v2SkillId: process.env.SUPERVITY_SKILL_ID,
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
        'x-api-token': process.env.SUPERVITY_API_TOKEN!,
        'x-api-org': process.env.SUPERVITY_ORG_ID!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supervityPayload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Supervity API Error:", errorBody);
        throw new Error(`Supervity API failed with status: ${response.status}`);
    }

    const result = await response.json();
    
    // NOTE: Storing execution logs is specified in the plan, but the immediate
    // response from Supervity might not be the final result if it's async.
    // For now, we'll assume a synchronous response for simplicity and log it.
    // A more robust implementation would use webhooks.
    await supabaseAdmin.from('negotiation_actions').insert({
        contract_id: contractId,
        user_id: userId,
        status: 'completed', // Assuming success
        supervity_run_id: result.runId || null, // Example field
        // recipient_email would come from agent's output
    });

    return NextResponse.json({success: true, data: result});

  } catch (error: any) {
    console.error('Error calling Supervity agent:', error);
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
