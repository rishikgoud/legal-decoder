'use server';
/**
 * @fileOverview An AI agent to translate legal analysis text.
 *
 * - translateAnalysis - A function that handles the translation.
 * - TranslateAnalysisInput - The input type.
 * - TranslateAnalysisOutput - The output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SupportedLanguagesSchema = z.enum(['en', 'hi', 'te', 'ta']);

export const TranslateAnalysisInputSchema = z.object({
  analysis: z.object({
    summary: z.string(),
    riskReason: z.string(),
    recommendation: z.string(),
  }),
  targetLanguage: SupportedLanguagesSchema,
});
export type TranslateAnalysisInput = z.infer<typeof TranslateAnalysisInputSchema>;

export const TranslateAnalysisOutputSchema = z.object({
  translatedSummary: z.string(),
  translatedRiskReason: z.string(),
  translatedRecommendation: z.string(),
});
export type TranslateAnalysisOutput = z.infer<
  typeof TranslateAnalysisOutputSchema
>;

export async function translateAnalysis(
  input: TranslateAnalysisInput
): Promise<TranslateAnalysisOutput> {
  return translateAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateAnalysisPrompt',
  input: {schema: TranslateAnalysisInputSchema},
  output: {schema: TranslateAnalysisOutputSchema},
  prompt: `You are a professional legal translator. Your task is to translate a segment of a legal contract analysis from English into the requested target language.

**Target Language Code:** {{{targetLanguage}}} (en: English, hi: Hindi, te: Telugu, ta: Tamil)

**Translation Rules (Follow Strictly):**
1.  **Preserve Legal Meaning:** The translation must be precise and maintain the exact legal intent and nuance of the original English text.
2.  **No Simplification:** Do not simplify or paraphrase the text. This is a direct translation, not a summarization.
3.  **Maintain Professional Tone:** The output must be formal and professional, suitable for a legal context.
4.  **Keep Structure:** If the original text contains bullet points, numbering, or specific formatting, preserve it in the translated output.

**English Analysis to Translate:**

*   **Summary:** {{{analysis.summary}}}
*   **Risk Reason:** {{{analysis.riskReason}}}
*   **Recommendation:** {{{analysis.recommendation}}}

Return a JSON object with the translated text in the specified fields.
`,
});

const translateAnalysisFlow = ai.defineFlow(
  {
    name: 'translateAnalysisFlow',
    inputSchema: TranslateAnalysisInputSchema,
    outputSchema: TranslateAnalysisOutputSchema,
  },
  async input => {
    if (input.targetLanguage === 'en') {
      return {
        translatedSummary: input.analysis.summary,
        translatedRiskReason: input.analysis.riskReason,
        translatedRecommendation: input.analysis.recommendation,
      };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
