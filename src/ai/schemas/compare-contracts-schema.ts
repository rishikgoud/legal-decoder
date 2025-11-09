
/**
 * @fileOverview Schemas and types for the compare-contracts-flow.
 *
 * - CompareContractsInputSchema, CompareContractsInput - The input schema and type.
 * - CompareContractsOutputSchema, CompareContractsOutput - The output schema and type.
 */

import {z} from 'zod';

export const CompareContractsInputSchema = z.object({
  contractOneText: z
    .string()
    .describe('The text content of the first contract (Contract A).'),
  contractTwoText: z
    .string()
    .describe('The text content of the second contract (Contract B).'),
});
export type CompareContractsInput = z.infer<
  typeof CompareContractsInputSchema
>;

export const RiskDifferenceSchema = z.object({
  clause: z.string().describe('The common clause with differing risk.'),
  contractA_risk: z
    .string()
    .describe("The risk level of the clause in Contract A."),
  contractB_risk: z
    .string()
    .describe("The risk level of the clause in Contract B."),
  contractA_reason: z.string().describe("The reasoning for the risk assessment of the clause in Contract A."),
  contractB_reason: z.string().describe("The reasoning for the risk assessment of the clause in Contract B."),
});
export type RiskDifferenceSchema = z.infer<typeof RiskDifferenceSchema>;


export const CompareContractsOutputSchema = z.object({
  summaryDiff: z
    .string()
    .describe('A high-level summary of the most important differences.'),
  summaryA: z.string().describe("A summary of the key points for Contract A."),
  summaryB: z.string().describe("A summary of the key points for Contract B."),
  addedClauses: z
    .array(z.string())
    .describe('Clauses present in Contract B but not in Contract A.'),
  removedClauses: z
    .array(z.string())
    .describe('Clauses present in Contract A but not in Contract B.'),
  riskDifferences: z
    .array(RiskDifferenceSchema)
    .describe(
      'Clauses that exist in both contracts but have different risk implications.'
    ),
});

export type CompareContractsOutput = z.infer<
  typeof CompareContractsOutputSchema
>;
