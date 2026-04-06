import React, { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { calculateInsights, ResultInsight } from '../utils/engine';
import { RefreshCw, Download } from 'lucide-react';
import { ContextData } from './ContextForm';
import { QUESTIONS } from '../data/questions';

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

interface ResultsProps {
    answers: Record<string, string>;
    onRetake: () => void;
    context: ContextData | null;
    isLoading?: boolean;
    onReady?: () => void;
}

function buildAnswerEvidence(answers: Record<string, string>) {
    return Object.entries(answers)
        .map(([questionId, optionId]) => {
            const question = QUESTIONS.find((entry) => entry.id === questionId);
            const option = question?.options.find((entry) => entry.id === optionId);

            if (!question || !option) {
                return null;
            }

            return `${question.text} ${option.label}`;
        })
        .filter((entry): entry is string => Boolean(entry));
}

function attachAnswerReference(insight: ResultInsight, evidence: string[]) {
    const supportingAnswer = evidence.find((entry) => {
        const normalizedCategory = insight.category.toLowerCase();
        return entry.toLowerCase().includes(normalizedCategory.slice(0, 5));
    });

    if (!supportingAnswer) {
        return insight.description;
    }

    return `${insight.description} That lines up with your answer: "${supportingAnswer}".`;
}

function buildFallbackResults(
    answers: Record<string, string>,
    context: ContextData | null
): GeneratedResults {
    const insights = calculateInsights(answers, context).slice(0, 4);
    const evidence = buildAnswerEvidence(answers);
    const summarySeed = evidence[0] ?? 'your overall dating approach';
    const strengthSeed = evidence.find((entry) => /listen|reflect|bonus|compromise|open|secure/i.test(entry));

    if (insights.length === 0) {
        return {
            headline: 'You are more ready than stuck',
            summary: `Your answers suggest a grounded approach to dating, especially around ${summarySeed.toLowerCase()}. There are no major friction points showing up right now, which usually means timing and consistency matter more than fixing yourself.`,
            insights: [
                {
                    category: 'Balance',
                    title: 'Your baseline looks healthy',
                    description: 'Your responses stayed mostly steady and flexible, which points to good self-awareness rather than a repeating block.',
                    action: 'Keep showing up where connection can happen, and notice who feels easy to be yourself around this week.',
                },
            ],
            strength: strengthSeed ?? 'You seem able to hold both self-respect and openness at the same time.',
            closing: 'Nothing here says you are behind; it says stay open and keep moving.',
        };
    }

    return {
        headline: insights[0]?.title ?? 'A few patterns are worth naming',
        summary: `A clear theme in your answers is how you respond around ${summarySeed.toLowerCase()}. These patterns are workable, and naming them honestly gives you something concrete to shift instead of guessing.`,
        insights: insights.map((insight) => ({
            category: insight.category,
            title: insight.title,
            description: attachAnswerReference(insight, evidence),
            action: insight.action,
        })),
        strength: strengthSeed ?? 'You took an honest look at yourself, and that kind of self-awareness is a real strength in dating.',
        closing: 'You do not need a personality transplant, just a few steadier choices repeated over time.',
    };
}

function isGeneratedResults(value: unknown): value is GeneratedResults {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as GeneratedResults;

    return typeof candidate.headline === 'string'
        && typeof candidate.summary === 'string'
        && Array.isArray(candidate.insights)
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

function LoadingState() {
    return (
        <div className="space-y-6 mb-12">
            {[0, 1, 2].map((item) => (
                <Card key={item} className="border-l-4 border-l-primary/60 animate-pulse">
                    <div className="space-y-4">
                        <div className="h-5 w-24 bg-slate-100 rounded-full" />
                        <div className="h-7 w-2/3 bg-slate-100 rounded-lg" />
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-slate-100 rounded" />
                            <div className="h-4 w-5/6 bg-slate-100 rounded" />
                            <div className="h-4 w-4/6 bg-slate-100 rounded" />
                        </div>
                        <div className="h-16 w-full bg-rose-50 rounded-lg" />
                    </div>
                </Card>
            ))}
        </div>
    );
}

export function Results({ answers, onRetake, context, isLoading = false, onReady }: ResultsProps) {
    const fallbackResults = React.useMemo(() => buildFallbackResults(answers, context), [answers, context]);
    const [result, setResult] = useState<GeneratedResults | null>(null);

    useEffect(() => {
        let cancelled = false;

        const generateResults = async () => {
            if (!context) {
                if (!cancelled) {
                    setResult(fallbackResults);
                    onReady?.();
                }
                return;
            }

            try {
                const response = await fetch('/api/generate-results', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ answers, context }),
                });

                if (!response.ok) {
                    throw new Error('Failed to generate results');
                }

                const payload = await response.json();
                const nextResult = isGeneratedResults(payload?.result) ? payload.result : fallbackResults;

                if (!cancelled) {
                    setResult(nextResult);
                    onReady?.();
                }
            } catch {
                if (!cancelled) {
                    setResult(fallbackResults);
                    onReady?.();
                }
            }
        };

        generateResults();

        return () => {
            cancelled = true;
        };
    }, [answers, context, fallbackResults, onReady]);

    const handlePrint = () => {
        window.print();
    };

    const displayResult = result ?? fallbackResults;
    const shouldShowLoading = isLoading || !result;

    return (
        <div className="max-w-3xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-10 space-y-4">
                <h1 className="text-3xl font-bold text-slate-800">Your Reflections</h1>
                {context && (
                    <p className="text-sm font-medium text-primary uppercase tracking-wider">
                        Analysis for: {context.ageRange} | {context.intention.replace('-', ' ')}
                    </p>
                )}
                <p className="text-slate-600 max-w-lg mx-auto">
                    {displayResult.summary}
                </p>
            </div>

            <Card className="mb-8 text-center py-10">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Core Pattern</p>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">{displayResult.headline}</h2>
                <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto">{displayResult.strength}</p>
            </Card>

            {shouldShowLoading ? (
                <LoadingState />
            ) : (
                <div className="space-y-6 mb-12">
                    {displayResult.insights.map((insight, index) => (
                        <Card key={`${insight.category}-${index}`} className="border-l-4 border-l-primary/60">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">
                                        {insight.category}
                                    </span>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                                        {insight.title}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed mb-4">
                                        {insight.description}
                                    </p>

                                    {insight.action && (
                                        <div className="bg-rose-50 rounded-lg p-4 mt-4">
                                            <p className="text-sm font-medium text-rose-800">
                                                Suggestion: <span className="text-rose-700 font-normal">{insight.action}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none mb-10">
                <h3 className="text-xl font-bold mb-3">A final thought</h3>
                <p className="text-slate-300 leading-relaxed">
                    {displayResult.closing}
                </p>
            </Card>

            <div className="flex justify-center gap-4 print:hidden">
                <Button onClick={onRetake} variant="secondary">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retake
                </Button>
                <Button onClick={handlePrint} variant="ghost">
                    <Download className="w-4 h-4 mr-2" />
                    Save Results
                </Button>
            </div>
        </div>
    );
}
