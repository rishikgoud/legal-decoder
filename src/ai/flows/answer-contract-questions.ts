
'use server';

/**
 * @fileOverview An AI agent that answers questions about a contract.
 *
 * - answerContractQuestions - A function that handles the question answering process.
 * - AnswerContractQuestionsInput - The input type for the answerContractQuestions function.
 * - AnswerContractQuestionsOutput - The return type for the answerContractQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AnswerContractQuestionsInputSchema = z.object({
  contractText: z.string().describe('The text content of the contract.'),
  question: z.string().describe('The question to be answered about the contract.'),
});
export type AnswerContractQuestionsInput = z.infer<typeof AnswerContractQuestionsInputSchema>;

const AnswerContractQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the contract.'),
});
export type AnswerContractQuestionsOutput = z.infer<typeof AnswerContractQuestionsOutputSchema>;

export async function answerContractQuestions(input: AnswerContractQuestionsInput): Promise<AnswerContractQuestionsOutput> {
  return answerContractQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerContractQuestionsPrompt',
  input: {schema: AnswerContractQuestionsInputSchema},
  output: {schema: AnswerContractQuestionsOutputSchema},
  prompt: `You are a legal expert specializing in contracts.

You will be provided with the text of a contract and a question about the contract.

Answer the question based on the information in the contract.

Contract Text: {{{contractText}}}

Question: {{{question}}}`,
});

const answerContractQuestionsFlow = ai.defineFlow(
  {
    name: 'answerContractQuestionsFlow',
    inputSchema: AnswerContractQuestionsInputSchema,
    outputSchema: AnswerContractQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
