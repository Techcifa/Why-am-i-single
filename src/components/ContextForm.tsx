import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ArrowLeft } from 'lucide-react';

export interface ContextData {
    ageRange: string;
    gender: string;
    intention: string;
}

interface ContextFormProps {
    onComplete: (data: ContextData) => void;
    onBack: () => void;
}

export function ContextForm({ onComplete, onBack }: ContextFormProps) {
    const [formData, setFormData] = useState<ContextData>({
        ageRange: '',
        gender: '',
        intention: ''
    });

    const isValid = formData.ageRange && formData.gender && formData.intention;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isValid) onComplete(formData);
    };

    const OptionBtn = ({ field, value, label }: { field: keyof ContextData, value: string, label: string }) => (
        <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, [field]: value }))}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${formData[field] === value
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={onBack} className="mb-6 text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <Card>
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">First, a little context</h2>
                    <p className="text-slate-500">This helps us frame your results more accurately.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Age */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">Age Range</label>
                        <div className="flex flex-wrap gap-2">
                            <OptionBtn field="ageRange" value="18-24" label="18-24" />
                            <OptionBtn field="ageRange" value="25-34" label="25-34" />
                            <OptionBtn field="ageRange" value="35-49" label="35-49" />
                            <OptionBtn field="ageRange" value="50+" label="50+" />
                        </div>
                    </div>

                    {/* Gender */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">Gender Identity</label>
                        <div className="flex flex-wrap gap-2">
                            <OptionBtn field="gender" value="female" label="Female" />
                            <OptionBtn field="gender" value="male" label="Male" />
                            <OptionBtn field="gender" value="non-binary" label="Non-binary" />
                            <OptionBtn field="gender" value="prefer-not" label="Prefer not to say" />
                        </div>
                    </div>

                    {/* Intention */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">Current Intention</label>
                        <div className="flex flex-wrap gap-2">
                            <OptionBtn field="intention" value="long-term" label="Long-term partnership" />
                            <OptionBtn field="intention" value="casual" label="Casual dating" />
                            <OptionBtn field="intention" value="open" label="Figuring it out" />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" fullWidth disabled={!isValid}>
                            Continue
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
