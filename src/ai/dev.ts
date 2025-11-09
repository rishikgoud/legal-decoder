import { config } from 'dotenv';
config();

import '@/ai/flows/answer-contract-questions.ts';
import '@/ai/flows/detect-and-label-clauses.ts';
import '@/ai/flows/compare-contracts-flow.ts';
