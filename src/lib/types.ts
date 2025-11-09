
export type Contract = {
  id: string;
  name: string;
  status: 'Pending' | 'Analyzed' | 'Error';
  riskLevel?: 'High' | 'Medium' | 'Low' | 'N/A';
  clauses: number;
  analyzedAt: string;
  userId?: string;
  highRiskClauses?: number;
};
