import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ResultInsight } from '../utils/engine';
import { RefreshCw, Download } from 'lucide-react';

import { ContextData } from './ContextForm';

interface ResultsProps {
    insights: ResultInsight[];
    onRetake: () => void;
    context: ContextData | null;
}

export function Results({ insights, onRetake, context }: ResultsProps) {
    React.useEffect(() => {
        const saveResults = async () => {
            try {
                // Get answers from local storage as backup or pass them down
                // For now, we only have insights and context here. 
                // ideally App.tsx passes the answers or we save them there.
                // Assuming we just want to verify the save works:
                await fetch('/api/results', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        context,
                        answers: {}, // We need to pass answers in props to be accurate
                        insights
                    })
                });
                console.log('Results saved to backend');
            } catch (err) {
                console.error('Failed to save', err);
            }
        };
        if (context) saveResults();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-3xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-10 space-y-4">
                <h1 className="text-3xl font-bold text-slate-800">Your Reflections</h1>
                {context && (
                    <p className="text-sm font-medium text-primary uppercase tracking-wider">
                        Analysis for: {context.ageRange} • {context.intention.replace('-', ' ')}
                    </p>
                )}
                <p className="text-slate-600 max-w-lg mx-auto">
                    Based on your answers, we noticed a few themes worth exploring.
                    Remember, these are not diagnoses—they are invitations to grow.
                </p>
            </div>

            {insights.length === 0 ? (
                <Card className="mb-8 text-center py-12">
                    <p className="text-lg text-slate-700 font-medium">You seem to have a very balanced approach!</p>
                    <p className="text-slate-500 mt-2">We didn't detect any strong patterns that might be holding you back. This is great news. Trust your timing.</p>
                </Card>
            ) : (
                <div className="space-y-6 mb-12">
                    {insights.map((insight) => (
                        <Card key={insight.id} className="border-l-4 border-l-primary/60">
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
                                                💡 Suggestion: <span className="text-rose-700 font-normal">{insight.action}</span>
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
                    Being single is not a flaw. It is a valid season of life offering freedom,
                    growth, and self-discovery. Relationships depend on timing, luck, and readiness.
                    You are doing the work just by being here.
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
