

'use server';

import { detectAndLabelClauses } from '@/ai/flows/detect-and-label-clauses';
import { type DetectAndLabelClausesOutput } from '@/ai/schemas/detect-and-label-clauses-schema';
import { answerContractQuestions } from '@/ai/flows/answer-contract-questions';
import { compareContracts } from '@/ai/flows/compare-contracts-flow';
import { type CompareContractsOutput } from '@/ai/schemas/compare-contracts-schema';
import { supabase } from '@/lib/supabaseClient';
import { getOverallRisk } from '@/lib/utils';


export async function analyzeContract(contractText: string, fileName: string) {
  if (!contractText || contractText.trim().length < 50) {
    return {
      success: false,
      error: 'Contract text is too short. Please provide a valid contract.',
      data: null,
    };
  }

  try {
    const analysis = await detectAndLabelClauses({ contractText });
    
    const { data: { user } } = await supabase.auth.getUser();

    if (analysis && user) {
      const { data, error } = await supabase
        .from('contracts')
        .insert([
          { 
            user_id: user.id,
            file_name: fileName,
           },
        ])
        .select();

      if (error) {
        console.error('Error saving to Supabase:', error);
        // We can still return the analysis to the user even if DB save fails
      } else {
        console.log('Analysis saved to Supabase:', data);
      }
    }


    return { success: true, data: analysis, error: null };
  } catch (error) {
    console.error('Error analyzing contract:', error);
    return {
      success: false,
      error: 'Failed to analyze the contract. The AI model may be unavailable or the input is invalid.',
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
        const result = await answerContractQuestions({ contractText, question });
        return { success: true, data: result.answer, error: null };
    } catch (error) {
        console.error('Error asking question:', error);
        return {
            success: false,
            error: 'Failed to get an answer. The AI model may be unavailable.',
            data: null,
        };
    }
}


export const compareTwoContracts = async (contractOneText: string, contractTwoText: string) => {
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
          error: 'Both contracts are identical. Please upload different documents to compare.',
          data: null,
      };
  }

  try {
    // Run all AI calls in parallel for efficiency
    const [comparisonResult, analysisA, analysisB] = await Promise.all([
      compareContracts({ contractOneText, contractTwoText }),
      detectAndLabelClauses({ contractText: contractOneText }),
      detectAndLabelClauses({ contractText: contractTwoText })
    ]);

    const result = {
      comparison: comparisonResult,
      analysisA,
      analysisB,
    };
    
    return { success: true, data: result, error: null };
  } catch (error) {
    console.error('Error comparing contracts:', error);
    return {
      success: false,
      error: 'Failed to compare the contracts. The AI model may be unavailable.',
      data: null,
    };
  }
}
