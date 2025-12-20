'use server';

import {detectAndLabelClauses} from '@/ai/flows/detect-and-label-clauses';
import {answerContractQuestions} from '@/ai/flows/answer-contract-questions';
import {compareContracts} from '@/ai/flows/compare-contracts-flow';

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
