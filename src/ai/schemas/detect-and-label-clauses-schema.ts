/**
 * @fileOverview Schemas and types for the detect-and-label-clauses flow.
 *
 * - DetectAndLabelClausesInputSchema, DetectAndLabelClausesInput - The input schema and type.
 * - DetectAndLabelClausesOutputSchema, DetectAndLabelClausesOutput - The output schema and type.
 * - ClauseSchema - The schema for a single clause.
 */

import {z} from 'zod';

export const DetectAndLabelClausesInputSchema = z.object({
  contractText: z
    .string()
    .describe('The text content of the contract to be analyzed.'),
});
export type DetectAndLabelClausesInput = z.infer<
  typeof DetectAndLabelClausesInputSchema
>;

export const ClauseSchema = z.object({
  clauseType: z.string().describe('The type of the clause (e.g., Confidentiality, Liability, Termination).'),
  clauseText: z.string().describe('The full original text of the clause.'),
  summary: z.string().describe('A plain English summary of the clause (2-3 lines).'),
  riskLevel: z.enum(['Low', 'Medium', 'High']).describe('The assessed potential risk of the clause (Low, Medium, or High).'),
  riskReason: z.string().describe('A brief explanation for the assigned risk rating.'),
  recommendation: z.string().describe('Suggested mitigation steps or recommendations for the user.'),
});

export const DetectAndLabelClausesOutputSchema = z.object({
    clauses: z.array(ClauseSchema),
    extractedEmails: z.array(z.string().email()).describe('An array of any email addresses found in the contract text.'),
});


export type DetectAndLabelClausesOutput = z.infer<
  typeof DetectAndLabelClausesOutputSchema
>;
