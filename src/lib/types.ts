import { DetectAndLabelClausesOutput } from "@/ai/schemas/detect-and-label-clauses-schema";

export type Contract = {
  id: string;
  name: string;
  status: 'Pending' | 'Analyzing' | 'Analyzed' | 'Error';
  riskLevel?: 'High' | 'Medium' | 'Low' | 'N/A';
  clauses: number;
  analyzedAt: string;
  userId?: string;
  highRiskClauses?: number;
  analysis_data?: DetectAndLabelClausesOutput | { error: string };
};
