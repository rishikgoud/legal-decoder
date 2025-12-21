
'use server';

import {detectAndLabelClauses} from '@/ai/flows/detect-and-label-clauses';
import {compareContracts} from '@/ai/flows/compare-contracts-flow';
import type { SelectedContract, MultiCompareContractsOutput } from '@/ai/schemas/compare-contracts-schema';
import { translateAnalysis, type TranslateAnalysisInput, type TranslateAnalysisOutput } from '@/ai/flows/translate-analysis-flow';


export async function compareContractsMulti(
  contracts: SelectedContract[]
): Promise<{ success: boolean; data: MultiCompareContractsOutput | null; error: string | null; }> {
  if (contracts.length < 2) {
    return {
      success: false,
      error: 'Please provide at least two contracts to compare.',
      data: null,
    };
  }

  try {
    const analyses = await Promise.all(
      contracts.map(c => detectAndLabelClauses({ contractText: c.text }))
    );

    const contractsWithAnalyses = contracts.map((contract, index) => ({
      ...contract,
      analysis: analyses[index],
    }));

    // The AI flow is still designed for two contracts, so we pass the first two.
    // This part can be enhanced later to support true multi-way AI comparison.
    const comparisonResult = await compareContracts({
        contractOneText: contractsWithAnalyses[0].text,
        contractTwoText: contractsWithAnalyses[1].text,
    });
    
    // For now, we will construct a global summary manually. A better approach
    // would be a dedicated AI call.
    const globalSummary = `This comparison analyzes ${contracts.length} documents. The primary differences noted are between "${contracts[0].name}" and "${contracts[1].name}". ${comparisonResult.summaryDiff}`;

    const result: MultiCompareContractsOutput = {
        globalSummary: globalSummary,
        contracts: contractsWithAnalyses,
        riskDifferences: comparisonResult.riskDifferences
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

export async function getTranslatedAnalysis(
  clauses: { summary: string; riskReason: string; recommendation: string }[],
  targetLanguage: 'en' | 'hi' | 'te' | 'ta'
): Promise<{ success: boolean; data: TranslateAnalysisOutput[] | null; error: string | null; }> {
  if (!clauses || clauses.length === 0 || !targetLanguage) {
    return { success: false, error: 'Invalid input for translation.', data: null };
  }

  try {
    // Phase 1: Translate one by one. Can be optimized to run in parallel.
    const translatedClauses: TranslateAnalysisOutput[] = [];
    for (const clause of clauses) {
      const result = await translateAnalysis({
        analysis: clause,
        targetLanguage: targetLanguage,
      });
      translatedClauses.push(result);
    }
    return { success: true, data: translatedClauses, error: null };
  } catch (error: any) {
    console.error('Error translating analysis:', error);
    return { success: false, error: 'Failed to translate the analysis.', data: null };
  }
}
