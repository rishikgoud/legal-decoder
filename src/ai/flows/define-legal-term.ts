'use server';

/**
 * @fileOverview An AI agent to define a legal term.
 *
 * - defineLegalTerm - A function that handles the definition process.
 * - DefineLegalTermInput - The input type for the defineLegalTerm function.
 * - DefineLegalTermOutput - The return type for the defineLegalTerm function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DefineLegalTermInputSchema = z.object({
  term: z.string().describe('The legal term to be defined.'),
});
export type DefineLegalTermInput = z.infer<typeof DefineLegalTermInputSchema>;

const DefineLegalTermOutputSchema = z.object({
  term: z.string(),
  simpleExplanation: z
    .string()
    .describe('A simple, plain-English explanation of the term.'),
  standardWording: z
    .string()
    .describe(
      'A typical example of how this clause or term might appear in a legal document.'
    ),
  implicationsAndRisks: z
    .string()
    .describe(
      'The potential implications and risks associated with this term for the user.'
    ),
});
export type DefineLegalTermOutput = z.infer<typeof DefineLegalTermOutputSchema>;

export async function defineLegalTerm(
  input: DefineLegalTermInput
): Promise<DefineLegalTermOutput> {
  return defineLegalTermFlow(input);
}

const prompt = ai.definePrompt({
  name: 'defineLegalTermPrompt',
  input: { schema: DefineLegalTermInputSchema },
  output: { schema: DefineLegalTermOutputSchema },
  prompt: `You are an expert legal dictionary AI. Your task is to provide a clear and comprehensive definition for a given legal term or clause.

The user wants to understand: "{{{term}}}".

For this term, you must provide the following, in a neutral and informative tone:
1.  **term**: Repeat the term back exactly as provided.
2.  **simpleExplanation**: A concise, easy-to-understand explanation in plain English.
3.  **standardWording**: A typical, standard example of how this term or clause would be worded in a legal contract.
4.  **implicationsAndRisks**: A summary of the key implications, potential risks, or what a user should pay attention to regarding this term.

Return the response strictly as a JSON object that adheres to the output schema.
`,
});

const defineLegalTermFlow = ai.defineFlow(
  {
    name: 'defineLegalTermFlow',
    inputSchema: DefineLegalTermInputSchema,
    outputSchema: DefineLegalTermOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
