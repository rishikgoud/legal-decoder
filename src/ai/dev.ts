
'use client';

import { config } from 'dotenv';
config();

import '@/ai/flows/answer-contract-questions.ts';
import '@/ai/flows/detect-and-label-clauses.ts';
import '@/ai/flows/compare-contracts-flow.ts';
import '@/ai/flows/translate-analysis-flow.ts';
import '@/ai/flows/define-legal-term.ts';
