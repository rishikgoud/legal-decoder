'use server';
/**
 * @fileOverview An AI agent to compare two contracts and highlight differences.
 *
 * - compareContracts - A function that handles the contract comparison process.
 * - CompareContractsInput - The input type for the compareContracts function.
 * - CompareContractsOutput - The return type for the compareContracts function.
 */

import {ai} from '@/ai/genkit';
import {
  CompareContractsInputSchema,
  CompareContractsOutputSchema,
  type CompareContractsInput,
  type CompareContractsOutput,
} from '@/ai/schemas/compare-contracts-schema';


export async function compareContracts(
  input: CompareContractsInput
): Promise<CompareContractsOutput> {
  return compareContractsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'compareContractsPrompt',
  input: {schema: CompareContractsInputSchema},
  output: {schema: CompareContractsOutputSchema},
  prompt: `You are a professional legal assistant AI specializing in contract comparison.

Given the text for two contracts, Contract A and Contract B, you must perform the following steps:
1.  Compare the two contracts to identify key differences in clauses, obligations, and risk levels.
2.  Provide a standalone summary of key points for Contract A.
3.  Provide a standalone summary of key points for Contract B.
4.  Identify clauses that are present in Contract B but not in Contract A ("added clauses").
5.  Identify clauses that are present in Contract A but not in Contract B ("removed clauses").
6.  Identify clauses that exist in both but have different risk implications. For each, provide the clause name, the risk for A, the risk for B, and the reasoning for each risk assessment.
7.  Provide a high-level summary of the most important differences overall.

Return the output strictly as a JSON object that adheres to the output schema.

Analyze the following contracts:

**Contract A:**
{{{contractOneText}}}

**Contract B:**
{{{contractTwoText}}}
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const compareContractsFlow = ai.defineFlow(
  {
    name: 'compareContractsFlow',
    inputSchema: CompareContractsInputSchema,
    outputSchema: CompareContractsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
