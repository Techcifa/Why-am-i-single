import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Heart, Sparkles } from 'lucide-react';

interface IntroProps {
    onStart: () => void;
}

export function Intro({ onStart }: IntroProps) {
    return (
        <div className="max-w-xl mx-auto text-center space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
            <div className="flex justify-center mb-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-rose-100 rounded-full blur-xl opacity-70 animate-pulse"></div>
                    <div className="relative bg-white p-4 rounded-full shadow-lg">
                        <Heart className="w-10 h-10 text-primary" fill="currentColor" />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
                    Why Am I Single?
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed">
                    A gentle space to reflect on your dating patterns, habits, and needs.
                    No judgment, no diagnosis—just observations to help you understand your journey.
                </p>
            </div>

            <Card className="text-left bg-slate-50/50 border-none shadow-sm space-y-4">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    What to expect
                </h3>
                <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex gap-2">
                        <span className="text-emerald-500">✓</span>
                        <span>15-20 questions about communication, standards, and lifestyle.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-emerald-500">✓</span>
                        <span>Takes about 3 minutes to complete.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-emerald-500">✓</span>
                        <span>Completely private—your answers stay on your device.</span>
                    </li>
                </ul>
            </Card>

            <div className="pt-4">
                <Button onClick={onStart} size="lg" className="w-full md:w-auto min-w-[200px] text-lg">
                    Begin Reflection
                </Button>
                <p className="mt-4 text-xs text-slate-400">
                    This brings awareness, not labels. You are okay just as you are.
                </p>
            </div>
        </div>
    );
}
