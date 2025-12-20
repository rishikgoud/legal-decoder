import {NextResponse} from 'next/server';
import {createSupabaseServerClient} from '@/lib/supabaseServer';
import {detectAndLabelClauses} from '@/ai/flows/detect-and-label-clauses';
import {type DetectAndLabelClausesOutput} from '@/ai/schemas/detect-and-label-clauses-schema';
import {getOverallRisk} from '@/lib/utils';

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {error: 'User not authenticated'},
      {status: 401}
    );
  }

  const { contractText, fileName } = await req.json();

  console.log(`Starting analysis for: ${fileName}, User: ${user.id}`);

  // 1. Create initial record in DB with 'Analyzing' status
  const {data: initialRecord, error: insertError} = await supabase
    .from('contract_analyses')
    .insert([
      {
        user_id: user.id,
        file_name: fileName,
        status: 'Analyzing',
        risk_level: 'N/A',
        clauses_count: 0,
        high_risk_clauses_count: 0,
      },
    ])
    .select()
    .single();

  if (insertError) {
    console.error('Error creating initial analysis record:', insertError);
    return NextResponse.json(
      {
        error: 'Failed to initiate analysis in the database. ' + insertError.message,
      },
      {status: 500}
    );
  }

  const analysisId = initialRecord.id;
  console.log(`Analysis record created with ID: ${analysisId}`);

  try {
    // 2. Run the AI analysis
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('AI service API key is missing from environment variables.');
    }
    
    if (!contractText || contractText.trim().length < 50) {
      throw new Error('Contract text is too short. Please provide a valid contract.');
    }
    
    const analysis: DetectAndLabelClausesOutput = await detectAndLabelClauses({contractText});
    console.log(`AI response received for analysis ID: ${analysisId}`);


    // 3. Update DB record on success
    const overallRisk = getOverallRisk(analysis);
    const highRiskCount = analysis.filter(c => c.riskLevel === 'High').length;

    const {data: updatedRecord, error: updateError} = await supabase
      .from('contract_analyses')
      .update({
        status: 'Analyzed',
        risk_level: overallRisk,
        clauses_count: analysis.length,
        high_risk_clauses_count: highRiskCount,
        analysis_data: analysis,
        analyzed_at: new Date().toISOString(),
      })
      .eq('id', analysisId)
      .select()
      .single();

    if (updateError) {
      // The analysis succeeded, but DB update failed. Log it, but return success to user.
      console.error('Error updating analysis record after success:', updateError);
      // We can still return the analysis to the user.
    }
    
    console.log(`Database update success for analysis ID: ${analysisId}`);
    return NextResponse.json({success: true, data: updatedRecord});

  } catch (error: any) {
    console.error(`Analysis failed for ID: ${analysisId} with error:`, error.message);

    // 4. Update DB record on failure
    const {error: errorUpdateError} = await supabase
      .from('contract_analyses')
      .update({
        status: 'Error',
        analysis_data: {error: error.message},
        analyzed_at: new Date().toISOString(),
      })
      .eq('id', analysisId);

    if (errorUpdateError) {
        console.error('CRITICAL: Failed to update analysis status to Error:', errorUpdateError);
    }
    
    return NextResponse.json(
        {
          error: error.message || 'Failed to analyze the contract due to an unexpected error.',
        },
        {status: 500}
      );
  }
}
