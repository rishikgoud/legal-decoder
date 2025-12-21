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

Given a contract text, you must perform the following steps:
1.  **Detect Clauses**: Identify individual clauses within the contract. For each clause:
    - Determine its type (e.g., Confidentiality, Liability, Termination, Jurisdiction).
    - Summarize the clause in plain English (2–3 lines).
    - Assess its potential risk and assign a risk level (Low, Medium, High).
    - Provide a clear and concise reason for the assigned risk rating.
    - Suggest actionable mitigation steps or recommendations for high or medium-risk clauses.
2.  **Extract Emails**: Scan the entire contract text and extract any email addresses you find. Return them in an array of strings.

Return the final output strictly as a JSON object that adheres to the output schema, containing both the 'clauses' array and the 'extractedEmails' array.

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
