import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DetectAndLabelClausesOutput } from "@/ai/schemas/detect-and-label-clauses-schema";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOverallRisk(analysis: DetectAndLabelClausesOutput): 'High' | 'Medium' | 'Low' | 'N/A' {
    if (!analysis || analysis.length === 0) return 'N/A';
    const hasHigh = analysis.some(c => c.riskLevel === 'High');
    const hasMedium = analysis.some(c => c.riskLevel === 'Medium');
    if (hasHigh) return 'High';
    if (hasMedium) return 'Medium';
    return 'Low';
}
