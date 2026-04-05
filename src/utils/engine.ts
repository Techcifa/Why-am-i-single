import { QUESTIONS, INSIGHTS_DB, CategoryId } from '../data/questions';

export interface ResultInsight {
    id: string;
    category: string;
    title: string;
    description: string;
    action: string;
}

export function calculateInsights(answers: Record<string, string>): ResultInsight[] {
    // 1. Scoring buckets
    const scores: Record<CategoryId, number> = {
        communication: 0,
        availability: 0,
        habits: 0,
        lifestyle: 0,
        social: 0,
        standards: 0,
        growth: 0
    };

    // 2. Tally scores
    Object.entries(answers).forEach(([questionId, optionId]) => {
        const question = QUESTIONS.find((q) => q.id === questionId);
        if (!question) return;

        const option = question.options.find((o) => o.id === optionId);
        if (!option) return;

        option.tags.forEach((tag) => {
            // Add value to valid categories
            if (scores[tag] !== undefined) {
                scores[tag] += option.value;
            }
        });
    });

    // 3. Generate Insights based on threshold
    // This is a simple logic: if score in a category > X, pick a relevant insight
    const thresholds: Record<CategoryId, number> = {
        communication: 2,
        availability: 3,
        habits: 3,
        lifestyle: 2,
        social: 2,
        standards: 3,
        growth: 2
    };

    const results: ResultInsight[] = [];

    (Object.keys(scores) as CategoryId[]).forEach((cat) => {
        if (scores[cat] >= thresholds[cat]) {
            const insightData = INSIGHTS_DB[cat][0]; // Simple selection for MVP
            if (insightData) {
                results.push({
                    id: cat,
                    category: cat.charAt(0).toUpperCase() + cat.slice(1),
                    title: insightData.title,
                    description: insightData.content,
                    action: insightData.suggestion,
                });
            }
        }
    });

    // Limit to top 3-5 to not overwhelm
    return results.slice(0, 5);
}
