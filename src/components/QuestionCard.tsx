import { Card } from './ui/Card';
import { Question, Option } from '../data/questions';

interface QuestionCardProps {
    question: Question;
    currentNumber: number;
    totalQuestions: number;
    onSelect: (optionId: string) => void;
    onBack: () => void;
}

export function QuestionCard({
    question,
    currentNumber,
    totalQuestions,
    onSelect,
    onBack
}: QuestionCardProps) {

    // Calculate progress percentage
    const progress = ((currentNumber - 1) / totalQuestions) * 100;

    return (
        <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <span>Question {currentNumber} of {totalQuestions}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <Card className="min-h-[400px] flex flex-col justify-center">
                <h2 className="text-xl md:text-2xl font-medium text-slate-800 mb-8 leading-snug">
                    {question.text}
                </h2>

                <div className="space-y-3">
                    {question.options.map((option: Option) => (
                        <button
                            key={option.id}
                            onClick={() => onSelect(option.id)}
                            className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-primary/50 hover:bg-rose-50/30 transition-all duration-200 group active:scale-[0.99]"
                        >
                            <span className="text-slate-600 group-hover:text-slate-900 transition-colors">
                                {option.label}
                            </span>
                        </button>
                    ))}
                </div>
            </Card>

            <div className="mt-8 flex justify-start">
                <button
                    onClick={onBack}
                    className="text-slate-400 hover:text-slate-600 text-sm font-medium px-4 py-2"
                >
                    Back to previous
                </button>
            </div>
        </div>
    );
}
