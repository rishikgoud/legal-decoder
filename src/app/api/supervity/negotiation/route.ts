
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { DetectAndLabelClausesOutput } from '@/ai/schemas/detect-and-label-clauses-schema';

export async function POST(req: Request) {
  try {
    console.log('🔥 NEGOTIATION API HIT');

    // 1. Validate Environment Variables
    const { SUPERVITY_AGENT_ID, SUPERVITY_SKILL_ID, SUPERVITY_API_TOKEN, SUPERVITY_ORG_ID } = process.env;
    if (!SUPERVITY_AGENT_ID || !SUPERVITY_SKILL_ID || !SUPERVITY_API_TOKEN || !SUPERVITY_ORG_ID) {
      console.error('Supervity environment variables are not fully configured.');
      return NextResponse.json({ error: 'Negotiation agent is not configured on the server.' }, { status: 500 });
    }

    // 2. Validate incoming request body
    const body = await req.json();
    console.log('📦 Incoming body:', body);
    const { userId, contractId } = body;

    if (!userId || !contractId) {
      return NextResponse.json({ error: 'Missing userId or contractId' }, { status: 400 });
    }

    // 3. Fetch the full analysis data from the database
    const { data: contract, error: contractError } = await supabaseAdmin
      .from('contract_analyses')
      .select('*')
      .eq('id', contractId)
      .eq('user_id', userId)
      .single();

    if (contractError || !contract) {
      console.error('Contract fetch error:', contractError);
      return NextResponse.json({ error: 'Unauthorized or contract not found' }, { status: 403 });
    }

    // Ensure analysis_data is valid and not an error object
    if (!contract.analysis_data || typeof contract.analysis_data !== 'object' || 'error' in contract.analysis_data) {
      return NextResponse.json({ error: 'Contract analysis data is missing or invalid.' }, { status: 400 });
    }

    // 4. Construct the rich input object for the agent.
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
    
    // CRITICAL: Log the payload before sending
    console.log("🚀 AGENT INPUT PAYLOAD:", JSON.stringify(agentInput, null, 2));

    const supervityPayload = {
      v2AgentId: SUPERVITY_AGENT_ID,
      v2SkillId: SUPERVITY_SKILL_ID,
      inputText: JSON.stringify(agentInput), // Pass the structured object as a string
    };

    // 5. Trigger the Supervity agent
    const response = await fetch('https://api.supervity.ai/botapi/draftSkills/v2/execute/', {
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
      console.error('Supervity API Error Response:', result);
      throw new Error(`Supervity API failed with status: ${response.status}. Details: ${result.error?.message || 'Unknown error'}`);
    }

    // 6. Log the successful trigger action to the database for auditing.
    await supabaseAdmin.from('negotiation_actions').insert({
      contract_id: contractId,
      user_id: userId,
      status: 'running',
      supervity_run_id: result.runId || null,
    });

    return NextResponse.json({ success: true, data: result });

  } catch (error: any) {
    console.error('❌ Negotiation API failed:', error.message);
    
    return NextResponse.json(
      { error: 'Failed to execute negotiation agent.', details: error.message },
      { status: 500 }
    );
  }
}
