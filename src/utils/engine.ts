import { QUESTIONS, INSIGHTS_DB, CategoryId } from '../data/questions';

export interface ResultInsight {
    id: string;
    category: string;
    title: string;
    description: string;
    action: string;
}

export interface InsightContext {
    ageRange: string;
    gender: string;
    intention: string;
}

export function calculateInsights(
    answers: Record<string, string>,
    _context?: InsightContext | null
): ResultInsight[] {
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
        const question = QUESTIONS.find((entry) => entry.id === questionId);
        if (!question) {
            return;
        }

        const option = question.options.find((entry) => entry.id === optionId);
        if (!option) {
            return;
        }

        option.tags.forEach((tag) => {
            if (scores[tag] !== undefined) {
                scores[tag] += option.value;
            }
        });
    });

    const thresholds: Record<CategoryId, number> = {
        communication: 2,
        availability: 3,
        habits: 3,
        lifestyle: 2,
        social: 2,
        standards: 3,
        growth: 2,
    };

    const rankedCategories = (Object.keys(scores) as CategoryId[])
        .map((category) => ({
            category,
            score: scores[category],
            threshold: thresholds[category],
        }))
        .filter(({ score, threshold }) => score >= threshold)
        .sort((left, right) => right.score - left.score);

    return rankedCategories.slice(0, 5).flatMap(({ category, score, threshold }) => {
        const entries = INSIGHTS_DB[category];
        const index = score >= threshold * 2 ? 1 : 0;
        const fallbackEntry = entries[0];
        const selectedEntry = entries[index] ?? fallbackEntry;

        if (!selectedEntry) {
            return [];
        }

        return [{
            id: category,
            category: category.charAt(0).toUpperCase() + category.slice(1),
            title: selectedEntry.title,
            description: selectedEntry.content,
            action: selectedEntry.suggestion,
        }];
    });
}
