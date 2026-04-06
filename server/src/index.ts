import express from 'express';
import cors from 'cors';
import { getDb } from './db';

interface ContextData {
    ageRange: string;
    gender: string;
    intention: string;
}

interface GeneratedInsight {
    category: string;
    title: string;
    description: string;
    action: string;
}

interface GeneratedResults {
    headline: string;
    summary: string;
    insights: GeneratedInsight[];
    strength: string;
    closing: string;
}

const app = express();
const port = 3000;
const RESULT_MODEL = 'deepseek-chat';

app.use(cors());
app.use(express.json());

function getFrontendEngine() {
    return require('../../src/utils/engine') as {
        calculateInsights: (answers: Record<string, string>, context?: ContextData | null) => GeneratedInsight[];
    };
}

function buildAnswerSummary(answers: Record<string, string>) {
    try {
        const frontendQuestions = require('../../src/data/questions') as {
            QUESTIONS: Array<{
                id: string;
                text: string;
                options: Array<{ id: string; label: string }>;
            }>;
        };

        return Object.entries(answers)
            .map(([questionId, optionId]) => {
                const question = frontendQuestions.QUESTIONS.find((entry) => entry.id === questionId);
                const option = question?.options.find((entry) => entry.id === optionId);

                if (!question || !option) {
                    return null;
                }

                return `- ${question.text}\n  Answer: ${option.label}`;
            })
            .filter((entry): entry is string => Boolean(entry))
            .join('\n');
    } catch {
        return JSON.stringify(answers, null, 2);
    }
}

function buildFallbackResults(answers: Record<string, string>, context: ContextData | null): GeneratedResults {
    let fallbackInsights: GeneratedInsight[] = [];

    try {
        const { calculateInsights } = getFrontendEngine();
        fallbackInsights = calculateInsights(answers, context).slice(0, 4);
    } catch (error) {
        console.error('Engine fallback unavailable, using generic fallback results:', error);
    }

    const contextLine = context
        ? `${context.ageRange}, ${context.gender}, ${context.intention.replace('-', ' ')}`
        : 'this stage of life';

    if (fallbackInsights.length === 0) {
        return {
            headline: 'You seem more steady than stuck',
            summary: `Your answers read as thoughtful and fairly balanced for ${contextLine}. Nothing major is jumping out as a repeating block, which usually means timing and consistency matter more than a dramatic fix.`,
            insights: [
                {
                    category: 'Balance',
                    title: 'No major repeating obstacle showed up',
                    description: 'Your responses stayed relatively grounded, so the issue may be less about self-sabotage and more about meeting the right people consistently.',
                    action: 'Choose one place or routine this week where new connection is actually possible and show up on purpose.',
                },
            ],
            strength: 'Your answers show perspective and a solid baseline of self-awareness.',
            closing: 'You are not behind; keep giving your real life more chances to intersect with real people.',
        };
    }

    return {
        headline: fallbackInsights[0].title,
        summary: `A few themes came through clearly in your answers for ${contextLine}. The good news is that these patterns are specific enough to work on, which means they can shift.`,
        insights: fallbackInsights.map((insight) => ({
            category: insight.category,
            title: insight.title,
            description: insight.description,
            action: insight.action,
        })),
        strength: 'You gave honest answers, and that honesty is one of the strongest starting points for change.',
        closing: 'Small shifts done consistently will help more than trying to become a different person overnight.',
    };
}

function extractJson(content: string) {
    const trimmed = content.trim();
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
        throw new Error('No JSON object found in DeepSeek response');
    }

    return trimmed.slice(firstBrace, lastBrace + 1);
}

function isGeneratedResults(value: unknown): value is GeneratedResults {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as GeneratedResults;

    return typeof candidate.headline === 'string'
        && candidate.headline.length > 0
        && typeof candidate.summary === 'string'
        && Array.isArray(candidate.insights)
        && candidate.insights.length >= 1
        && candidate.insights.length <= 4
        && candidate.insights.every((insight) => (
            insight
            && typeof insight.category === 'string'
            && typeof insight.title === 'string'
            && typeof insight.description === 'string'
            && typeof insight.action === 'string'
        ))
        && typeof candidate.strength === 'string'
        && typeof candidate.closing === 'string';
}

async function generateAiResults(
    answers: Record<string, string>,
    context: ContextData | null
): Promise<GeneratedResults> {
    const apiKey = process.env.DEEPSEEK_API_KEY?.trim();

    if (!apiKey) {
        return buildFallbackResults(answers, context);
    }

    const answerSummary = buildAnswerSummary(answers) || '- No answers provided';
    const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: RESULT_MODEL,
            temperature: 0.7,
            max_tokens: 1200,
            messages: [
                {
                    role: 'system',
                    content: 'You are a compassionate but direct relationship coach fluent in attachment theory. You sound like a wise trusted friend, not a therapist. You never use clinical labels. You never say anything that could apply to everyone. Return only valid JSON. No markdown. No preamble. No explanation.',
                },
                {
                    role: 'user',
                    content: `Context: ${context ? `age ${context.ageRange}, gender ${context.gender}, intention ${context.intention}` : 'No context provided'}\nAnswers:\n${answerSummary}\nReturn only this JSON shape:\n{\n  "headline": "string - max 12 words, names their core pattern honestly",\n  "summary": "string - 2-3 sentences, warm and direct, specific to their answers",\n  "insights": [\n    {\n      "category": "string",\n      "title": "string",\n      "description": "string - must reference something from their actual answers",\n      "action": "string - one concrete thing to try this week"\n    }\n  ],\n  "strength": "string - a genuine strength found in their answers",\n  "closing": "string - one encouraging sentence"\n}`,
                },
            ],
        }),
    });

    if (!response.ok) {
        throw new Error(`DeepSeek request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;

    if (typeof content !== 'string') {
        throw new Error('DeepSeek response did not include text content');
    }

    const parsed = JSON.parse(extractJson(content)) as unknown;

    if (!isGeneratedResults(parsed)) {
        throw new Error('DeepSeek returned malformed JSON payload');
    }

    return parsed;
}

app.post('/api/generate-results', async (req, res) => {
    const { context, answers } = req.body as {
        context: ContextData | null;
        answers: Record<string, string>;
    };

    try {
        let result: GeneratedResults;

        try {
            result = await generateAiResults(answers ?? {}, context ?? null);
        } catch (error) {
            console.error('AI result generation failed, falling back to local engine:', error);
            result = buildFallbackResults(answers ?? {}, context ?? null);
        }

        const db = await getDb();

        await db.run(
            'INSERT INTO results (context, answers, insights) VALUES (?, ?, ?)',
            [JSON.stringify(context ?? null), JSON.stringify(answers ?? {}), JSON.stringify(result)]
        );

        res.json({ result });
    } catch (error) {
        console.error('Error generating result:', error);
        res.status(500).json({ error: 'Failed to generate result' });
    }
});

app.get('/api/stats', async (_req, res) => {
    try {
        const db = await getDb();
        const count = await db.get('SELECT COUNT(*) as count FROM results');
        res.json(count);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
