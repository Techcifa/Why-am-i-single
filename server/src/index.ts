import 'dotenv/config';
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

type CategoryId =
    | 'communication'
    | 'availability'
    | 'habits'
    | 'lifestyle'
    | 'social'
    | 'standards'
    | 'growth';

const QUESTIONS = [
    {
        id: 'comm_1',
        text: 'When a disagreement starts with someone you’re dating, what is your first instinct?',
        options: [
            { id: 'a', label: 'I usually withdraw or go silent to avoid making it worse.' },
            { id: 'b', label: 'I try to fix it immediately, sometimes feeling anxious if it’s not resolved.' },
            { id: 'c', label: 'I listen and try to understand their side before explaining mine.' },
            { id: 'd', label: 'I get defensive if I feel attacked.' },
        ],
    },
    {
        id: 'comm_2',
        text: 'How comfortable are you expressing your needs in the early stages of dating?',
        options: [
            { id: 'a', label: 'Very uncomfortable. I don’t want to seem "needy".' },
            { id: 'b', label: 'I drop hints and hope they pick up on them.' },
            { id: 'c', label: 'Comfortable. I say what I mean clearly and kindly.' },
            { id: 'd', label: 'I tend to focus entirely on their needs instead of mine.' },
        ],
    },
    {
        id: 'avail_1',
        text: 'When someone you like starts getting really close to you emotionally, how do you feel?',
        options: [
            { id: 'a', label: 'Excited and secure.' },
            { id: 'b', label: 'I panic slightly and wonder if I’m losing my freedom.' },
            { id: 'c', label: 'I worry they will see the "real" me and leave.' },
            { id: 'd', label: 'I lose interest once the "chase" is over.' },
        ],
    },
    {
        id: 'avail_2',
        text: 'How do you process your own difficult emotions?',
        options: [
            { id: 'a', label: 'I often numb out or distract myself (work, scrolling, going out).' },
            { id: 'b', label: 'I rely heavily on a partner to soothe me.' },
            { id: 'c', label: 'I take time to reflect, maybe talk to a friend, and process it.' },
        ],
    },
    {
        id: 'stand_1',
        text: 'When you meet a new potential partner, what do you look for first?',
        options: [
            { id: 'a', label: 'Reasons why it won’t work (red flags).' },
            { id: 'b', label: 'Chemistry and spark.' },
            { id: 'c', label: 'Shared values and how I feel around them.' },
            { id: 'd', label: 'If they check every box on my list.' },
        ],
    },
    {
        id: 'stand_2',
        text: 'How do you view "settling"?',
        options: [
            { id: 'a', label: 'I refuse to settle. I want everything perfect or nothing.' },
            { id: 'b', label: 'I’m terrified of settling, so I end things quickly.' },
            { id: 'c', label: 'Compromise is normal, but core values aren’t negotiable.' },
        ],
    },
    {
        id: 'life_1',
        text: 'How does a relationship fit into your current life?',
        options: [
            { id: 'a', label: 'It’s my #1 priority above everything else.' },
            { id: 'b', label: 'I’m extremely busy; I don’t know where I’d fit one in.' },
            { id: 'c', label: 'I have a full life, but I make space for connection.' },
            { id: 'd', label: 'I’m happy alone, maybe too happy to change my routine.' },
        ],
    },
    {
        id: 'soc_1',
        text: 'How often do you put yourself in situations to meet new people?',
        options: [
            { id: 'a', label: 'Rarely. I stick to my existing circle.' },
            { id: 'b', label: 'I use apps, but rarely go on actual dates.' },
            { id: 'c', label: 'Frequently. I’m open to meeting people anywhere.' },
            { id: 'd', label: 'I wait for them to come to me.' },
        ],
    },
    {
        id: 'habit_1',
        text: 'Reflecting on your past relationships, is there a pattern?',
        options: [
            { id: 'a', label: 'I tend to date "projects" I need to fix.' },
            { id: 'b', label: 'They usually leave me suddenly.' },
            { id: 'c', label: 'I lose interest as soon as it gets serious.' },
            { id: 'd', label: 'Every relationship has been different.' },
        ],
    },
    {
        id: 'habit_2',
        text: 'How do you handle rejection in dating?',
        options: [
            { id: 'a', label: 'I take it very personally and give up for a while.' },
            { id: 'b', label: 'I get angry or resentful.' },
            { id: 'c', label: 'It stings, but I move on knowing it wasn’t a match.' },
        ],
    },
    {
        id: 'grow_1',
        text: 'How happy are you with your life outside of dating?',
        options: [
            { id: 'a', label: 'Not very. I feel I need a partner to be happy.' },
            { id: 'b', label: 'I’m content, but I often feel like something is missing.' },
            { id: 'c', label: 'I love my life. A partner would just be a bonus.' },
        ],
    },
] as const;

const ANSWER_SCORES: Record<string, Record<string, { value: number; tags: CategoryId[] }>> = {
    comm_1: {
        a: { value: 2, tags: ['communication'] },
        b: { value: 2, tags: ['communication'] },
        c: { value: 0, tags: ['communication'] },
        d: { value: 2, tags: ['communication'] },
    },
    comm_2: {
        a: { value: 3, tags: ['communication'] },
        b: { value: 2, tags: ['communication'] },
        c: { value: 0, tags: ['communication'] },
        d: { value: 2, tags: ['communication'] },
    },
    avail_1: {
        a: { value: 0, tags: ['availability'] },
        b: { value: 3, tags: ['availability'] },
        c: { value: 3, tags: ['availability'] },
        d: { value: 3, tags: ['availability'] },
    },
    avail_2: {
        a: { value: 2, tags: ['availability'] },
        b: { value: 2, tags: ['availability'] },
        c: { value: 0, tags: ['availability'] },
    },
    stand_1: {
        a: { value: 3, tags: ['standards'] },
        b: { value: 1, tags: ['standards'] },
        c: { value: 0, tags: ['standards'] },
        d: { value: 2, tags: ['standards'] },
    },
    stand_2: {
        a: { value: 3, tags: ['standards'] },
        b: { value: 2, tags: ['standards'] },
        c: { value: 0, tags: ['standards'] },
    },
    life_1: {
        a: { value: 2, tags: ['lifestyle'] },
        b: { value: 3, tags: ['lifestyle'] },
        c: { value: 0, tags: ['lifestyle'] },
        d: { value: 2, tags: ['lifestyle'] },
    },
    soc_1: {
        a: { value: 3, tags: ['social'] },
        b: { value: 2, tags: ['social'] },
        c: { value: 0, tags: ['social'] },
        d: { value: 2, tags: ['social'] },
    },
    habit_1: {
        a: { value: 3, tags: ['habits'] },
        b: { value: 2, tags: ['habits'] },
        c: { value: 3, tags: ['habits'] },
        d: { value: 0, tags: ['habits'] },
    },
    habit_2: {
        a: { value: 2, tags: ['habits'] },
        b: { value: 2, tags: ['habits'] },
        c: { value: 0, tags: ['habits'] },
    },
    grow_1: {
        a: { value: 3, tags: ['growth'] },
        b: { value: 1, tags: ['growth'] },
        c: { value: 0, tags: ['growth'] },
    },
};

const INSIGHTS_DB: Record<CategoryId, Array<{ title: string; content: string; suggestion: string }>> = {
    communication: [
        {
            title: 'Silent treatment limits connection',
            content: 'You may tend to withdraw during conflict. While this protects you in the moment, it can leave partners feeling shut out.',
            suggestion: "Try saying 'I need a moment to think' instead of going silent.",
        },
        {
            title: 'Hyper-independence',
            content: "You might find it hard to express needs because you're used to doing everything yourself.",
            suggestion: 'Experiment with asking for small favors to build trust.',
        },
    ],
    availability: [
        {
            title: 'Fear of intimacy',
            content: "Patterns suggest you might pull away when things get 'real'. This is often a protective mechanism, not a lack of capability for love.",
            suggestion: "Reflect on what getting 'hurt' actually means to you now vs. in the past.",
        },
    ],
    habits: [
        {
            title: 'Attracted to potential',
            content: 'You may be dating who people *could* be, rather than who they are right now.',
            suggestion: 'Try evaluating your next date strictly on who they are today.',
        },
    ],
    lifestyle: [
        {
            title: 'Too busy for love?',
            content: 'Your life is full, which is great, but there might not be practical space for a partner right now.',
            suggestion: "Look at your schedule. Where would a partner actually fit?",
        },
    ],
    social: [
        {
            title: 'Waiting to be found',
            content: 'You might be hoping love finds you without changing your routine. Love often requires new contexts.',
            suggestion: "Try one new social activity this month where the goal isn't dating.",
        },
    ],
    standards: [
        {
            title: 'The perfection trap',
            content: "Looking for reasons to say 'no' keeps you safe, but it also keeps you single.",
            suggestion: "Try looking for 'green flags' first on your next date.",
        },
    ],
    growth: [
        {
            title: 'External validation',
            content: "You might be looking for a relationship to 'fix' how you feel about your life.",
            suggestion: 'Focus on building a life you love on your own first.',
        },
    ],
};

const THRESHOLDS: Record<CategoryId, number> = {
    communication: 2,
    availability: 3,
    habits: 3,
    lifestyle: 2,
    social: 2,
    standards: 3,
    growth: 2,
};

const app = express();
const port = 3000;
const RESULT_MODEL = 'deepseek-chat';

app.use(cors());
app.use(express.json());

function buildAnswerSummary(answers: Record<string, string>) {
    const summary = Object.entries(answers)
        .map(([questionId, optionId]) => {
            const question = QUESTIONS.find((entry) => entry.id === questionId);
            const option = question?.options.find((entry) => entry.id === optionId);

            if (!question || !option) {
                return null;
            }

            return `- ${question.text}\n  Answer: ${option.label}`;
        })
        .filter((entry): entry is string => Boolean(entry))
        .join('\n');

    return summary || JSON.stringify(answers, null, 2);
}

function buildFallbackResults(answers: Record<string, string>, context: ContextData | null): GeneratedResults {
    const scores: Record<CategoryId, number> = {
        communication: 0,
        availability: 0,
        habits: 0,
        lifestyle: 0,
        social: 0,
        standards: 0,
        growth: 0,
    };

    Object.entries(answers).forEach(([questionId, optionId]) => {
        const answer = ANSWER_SCORES[questionId]?.[optionId];
        if (!answer) {
            return;
        }

        answer.tags.forEach((tag) => {
            scores[tag] += answer.value;
        });
    });

    const fallbackInsights = (Object.keys(scores) as CategoryId[])
        .map((category) => ({
            category,
            score: scores[category],
            threshold: THRESHOLDS[category],
        }))
        .filter(({ score, threshold }) => score >= threshold)
        .sort((left, right) => right.score - left.score)
        .slice(0, 4)
        .flatMap(({ category, score, threshold }) => {
            const entries = INSIGHTS_DB[category];
            const selected = entries[score >= threshold * 2 ? 1 : 0] ?? entries[0];

            if (!selected) {
                return [];
            }

            return [{
                category: category.charAt(0).toUpperCase() + category.slice(1),
                title: selected.title,
                description: selected.content,
                action: selected.suggestion,
            }];
        });

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

app.post('/api/chat', async (req, res) => {
    try {
        const {
            messages,
            context,
            answers,
            results,
        } = req.body as {
            messages: Array<{ role: 'user' | 'assistant'; content: string }>;
            context: ContextData;
            answers: Record<string, string>;
            results: GeneratedResults;
        };

        const apiKey = process.env.DEEPSEEK_API_KEY?.trim();

        if (!apiKey) {
            throw new Error('Missing DeepSeek API key');
        }

        const answerSummary = buildAnswerSummary(answers ?? {});
        const insightTitles = Array.isArray(results?.insights)
            ? results.insights.map((insight) => insight.title).join(', ')
            : '';
        const systemPrompt = [
            'You are a compassionate but direct AI coach continuing a conversation after a dating self-reflection quiz.',
            `Context: age ${context?.ageRange ?? 'unknown'}, gender ${context?.gender ?? 'unknown'}, intention ${context?.intention ?? 'unknown'}.`,
            `Quiz answers:\n${answerSummary}`,
            `Results headline: ${results?.headline ?? 'Unknown'}.`,
            `Insight titles: ${insightTitles || 'None provided'}.`,
            'Stay on the topic of dating, relationships, and self-growth.',
            'If the user asks for something unrelated, redirect warmly but firmly back to their relationships or growth.',
            'Never diagnose.',
            'Never recommend therapy directly.',
            'Sound like a wise trusted friend, not a chatbot.',
            'Keep responses under 120 words unless the user asks something that genuinely needs more.',
        ].join('\n\n');

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: RESULT_MODEL,
                temperature: 0.75,
                max_tokens: 400,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...((messages ?? []).filter((message) =>
                        message
                        && (message.role === 'user' || message.role === 'assistant')
                        && typeof message.content === 'string'
                        && message.content.trim().length > 0
                    )),
                ],
            }),
        });

        if (!response.ok) {
            throw new Error('Chat request failed');
        }

        const payload = await response.json();
        const reply = payload?.choices?.[0]?.message?.content;

        if (typeof reply !== 'string' || !reply.trim()) {
            throw new Error('Chat reply missing');
        }

        res.json({ reply: reply.trim() });
    } catch {
        res.status(200).json({ reply: "I'm having trouble connecting right now. Try again in a moment." });
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
