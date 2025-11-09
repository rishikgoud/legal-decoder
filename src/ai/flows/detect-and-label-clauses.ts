'use server';
/**
 * @fileOverview An AI agent to detect and label clauses in a contract.
 *
 * - detectAndLabelClauses - A function that handles the clause detection and labeling process.
 */

import {ai} from '@/ai/genkit';
import {
  DetectAndLabelClausesInputSchema,
  DetectAndLabelClausesOutputSchema,
  type DetectAndLabelClausesInput,
  type DetectAndLabelClausesOutput,
} from '@/ai/schemas/detect-and-label-clauses-schema';


export async function detectAndLabelClauses(
  input: DetectAndLabelClausesInput
): Promise<DetectAndLabelClausesOutput> {
  return detectAndLabelClausesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectAndLabelClausesPrompt',
  input: {schema: DetectAndLabelClausesInputSchema},
  output: {schema: DetectAndLabelClausesOutputSchema},
  prompt: `You are a professional legal assistant AI specializing in contract risk analysis.

Given a contract text, you must perform the following steps for each clause:
1.  Identify individual clauses within the contract.
2.  For each clause, determine its type (e.g., Confidentiality, Liability, Termination, Jurisdiction).
3.  Summarize the clause in plain English (2–3 lines).
4.  Assess its potential risk and assign a risk level (Low, Medium, High).
5.  Provide a clear and concise reason for the assigned risk rating.
6.  Suggest actionable mitigation steps or recommendations for high or medium-risk clauses.

Return the output strictly as a JSON array of clause objects, where each object contains the identified clause, its type, a summary, risk level, risk reason, and recommendation.

Analyze the following contract text:

{{{contractText}}}
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const detectAndLabelClausesFlow = ai.defineFlow(
  {
    name: 'detectAndLabelClausesFlow',
    inputSchema: DetectAndLabelClausesInputSchema,
    outputSchema: DetectAndLabelClausesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
