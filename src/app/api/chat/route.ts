
import { NextResponse } from 'next/server';
import {answerContractQuestions, type AnswerContractQuestionsOutput} from '@/ai/flows/answer-contract-questions';

export async function POST(req: Request) {
  const { contractText, question } = await req.json();

  if (!contractText || !question) {
    return NextResponse.json({
      success: false,
      error: 'Missing contract text or question.',
      data: null,
    }, { status: 400 });
  }

  try {
    const result = await answerContractQuestions({contractText, question});
    return NextResponse.json({success: true, data: result, error: null});
  } catch (error) {
    console.error('Error asking question:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get an answer. The AI model may be unavailable.',
      data: null,
    }, { status: 500 });
  }
}
