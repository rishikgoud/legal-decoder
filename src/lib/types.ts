import { DetectAndLabelClausesOutput } from "@/ai/schemas/detect-and-label-clauses-schema";

export type Clause = DetectAndLabelClausesOutput['clauses'][0];

export type Contract = {
  id: string;
  name: string;
  status: 'Pending' | 'Analyzing' | 'Analyzed' | 'Error';
  riskLevel?: 'High' | 'Medium' | 'Low' | 'N/A';
  clauses: number;
  analyzedAt: string;
  userId?: string;
  highRiskClauses?: number;
  analysis_data?: Clause[] | { error: string };
  extracted_emails?: string[];
};

export type NegotiationAction = {
  id: string;
  contract_id: string;
  user_id: string;
  recipient_email?: string;
  status: 'drafted' | 'sent' | 'failed' | 'completed' | 'running';
  executed_at: string;
  supervity_run_id?: string;
};
