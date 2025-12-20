'use server';

import {detectAndLabelClauses} from '@/ai/flows/detect-and-label-clauses';
import {type DetectAndLabelClausesOutput} from '@/ai/schemas/detect-and-label-clauses-schema';
import {answerContractQuestions} from '@/ai/flows/answer-contract-questions';
import {compareContracts} from '@/ai/flows/compare-contracts-flow';
import {type CompareContractsOutput} from '@/ai/schemas/compare-contracts-schema';
import { getOverallRisk } from '@/lib/utils';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function analyzeContract(
  contractText: string,
  fileName: string,
) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const errorMsg = 'User not authenticated – cannot create analysis';
    console.error(errorMsg);
    return { success: false, error: errorMsg, data: null };
  }
  
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
    return {
      success: false,
      error: 'Failed to initiate analysis in the database. ' + insertError.message,
      data: null,
    };
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
    return {success: true, data: updatedRecord, error: null};

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
    
    return {
      success: false,
      error:
        error.message ||
        'Failed to analyze the contract due to an unexpected error.',
      data: null,
    };
  }
}

export async function askQuestion(contractText: string, question: string) {
  if (!contractText || !question) {
    return {
      success: false,
      error: 'Missing contract text or question.',
      data: null,
    };
  }

  try {
    const result = await answerContractQuestions({contractText, question});
    return {success: true, data: result.answer, error: null};
  } catch (error) {
    console.error('Error asking question:', error);
    return {
      success: false,
      error: 'Failed to get an answer. The AI model may be unavailable.',
      data: null,
    };
  }
}

export async function compareTwoContracts(
  contractOneText: string,
  contractTwoText: string
) {
  if (!contractOneText || !contractTwoText) {
    return {
      success: false,
      error: 'Please provide the text for both contracts.',
      data: null,
    };
  }

  if (contractOneText.trim() === contractTwoText.trim()) {
    return {
      success: false,
      error:
        'Both contracts are identical. Please upload different documents to compare.',
      data: null,
    };
  }

  try {
    // Run all AI calls in parallel for efficiency
    const [comparisonResult, analysisA, analysisB] = await Promise.all([
      compareContracts({contractOneText, contractTwoText}),
      detectAndLabelClauses({contractText: contractOneText}),
      detectAndLabelClauses({contractText: contractTwoText}),
    ]);

    const result = {
      comparison: comparisonResult,
      analysisA,
      analysisB,
    };

    return {success: true, data: result, error: null};
  } catch (error) {
    console.error('Error comparing contracts:', error);
    return {
      success: false,
      error: 'Failed to compare the contracts. The AI model may be unavailable.',
      data: null,
    };
  }
}
