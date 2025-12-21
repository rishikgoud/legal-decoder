
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
  answer: z
    .string()
    .describe('A direct, concise answer to the user\'s question.'),
  clauseText: z
    .string()
    .optional()
    .describe(
      'The full, original text of the single most relevant clause from the contract that supports the answer.'
    ),
  explanation: z
    .string()
    .optional()
    .describe(
      'A brief explanation of how the provided clauseText supports the answer.'
    ),
});
export type AnswerContractQuestionsOutput = z.infer<typeof AnswerContractQuestionsOutputSchema>;

export async function answerContractQuestions(input: AnswerContractQuestionsInput): Promise<AnswerContractQuestionsOutput> {
  return answerContractQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerContractQuestionsPrompt',
  input: {schema: AnswerContractQuestionsInputSchema},
  output: {schema: AnswerContractQuestionsOutputSchema},
  prompt: `You are an expert legal assistant AI that answers specific questions about a contract.

**Your Task:**
1.  Read the user's question and the full contract text provided.
2.  Provide a clear and direct answer to the question based *only* on the information within the contract.
3.  Identify the *single most relevant clause* from the contract that directly supports your answer.
4.  Provide a brief explanation of how that clause justifies your answer.

**Rules:**
-   If no relevant clause is found, you may omit the 'clauseText' and 'explanation' fields.
-   Your answer must be accurate and derived strictly from the provided legal text.
-   Return the response as a JSON object matching the defined schema.

**Contract Text:**
\`\`\`
{{{contractText}}}
\`\`\`

**User's Question:**
"{{{question}}}"
`,
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
