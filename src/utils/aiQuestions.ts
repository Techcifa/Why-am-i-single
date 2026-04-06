import { QUESTIONS, Question } from '../data/questions';
import type { ContextData } from '../components/ContextForm';

interface GetNextQuestionParams {
    answers: Record<string, string>;
    context: ContextData;
    askedQuestionIds: string[];
}

const QUESTION_BY_ID = new Map(QUESTIONS.map((question) => [question.id, question]));
const QUESTION_SELECTION_MODEL = 'deepseek-chat';
const QUESTION_TIMEOUT_MS = 8000;
const EARLY_STOP_MINIMUM = 5;

function buildHumanReadableSummary(answers: Record<string, string>) {
    return Object.entries(answers)
        .map(([questionId, optionId]) => {
            const question = QUESTION_BY_ID.get(questionId);
            const option = question?.options.find((entry) => entry.id === optionId);

            if (!question || !option) {
                return null;
            }

            return `- ${question.text}\n  Answer: ${option.label}`;
        })
        .filter((entry): entry is string => Boolean(entry))
        .join('\n');
}

function getSequentialFallbackQuestion(askedQuestionIds: string[]): Question | null {
    return QUESTIONS.find((question) => !askedQuestionIds.includes(question.id)) ?? null;
}

async function requestAdaptiveQuestion(
    context: ContextData,
    answers: Record<string, string>,
    remainingQuestions: Question[]
) {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY?.trim();

    if (!apiKey || remainingQuestions.length === 0) {
        return null;
    }

    const humanReadableSummary = buildHumanReadableSummary(answers) || '- No answers yet';
    const remainingList = remainingQuestions
        .map((question) => `${question.id}: ${question.text}`)
        .join('\n');

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), QUESTION_TIMEOUT_MS);

    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: QUESTION_SELECTION_MODEL,
                temperature: 0.3,
                max_tokens: 20,
                messages: [
                    {
                        role: 'system',
                        content: 'You only return one token-like answer. Return a single remaining question ID, or DONE if enough insight already exists.',
                    },
                    {
                        role: 'user',
                        content: `You are analysing someone's dating patterns.\nContext: age ${context.ageRange}, gender: ${context.gender}, intention: ${context.intention}\nAnswers so far:\n${humanReadableSummary}\nRemaining question IDs and text:\n${remainingList}\nReturn ONLY the single question ID that will reveal the most new insight.`,
                    },
                ],
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            return null;
        }

        const payload = await response.json();
        const content = payload.choices?.[0]?.message?.content;

        if (typeof content !== 'string') {
            return null;
        }

        return content.trim();
    } catch {
        return null;
    } finally {
        window.clearTimeout(timeout);
    }
}

export async function getNextQuestion({
    answers,
    context,
    askedQuestionIds,
}: GetNextQuestionParams): Promise<Question | null> {
    const remainingQuestions = QUESTIONS.filter((question) => !askedQuestionIds.includes(question.id));
    if (remainingQuestions.length === 0) {
        return null;
    }

    const selection = await requestAdaptiveQuestion(context, answers, remainingQuestions);
    const normalizedSelection = selection?.replace(/[`\s]/g, '').toUpperCase();

    if (normalizedSelection === 'DONE' && askedQuestionIds.length >= EARLY_STOP_MINIMUM) {
        return null;
    }

    const matchedQuestion = remainingQuestions.find(
        (question) => question.id.toUpperCase() === normalizedSelection
    );

    return matchedQuestion ?? getSequentialFallbackQuestion(askedQuestionIds);
}
