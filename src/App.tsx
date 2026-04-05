import { useState } from 'react';
import { QUESTIONS } from './data/questions';
import { calculateInsights } from './utils/engine';
import { Intro } from './components/Intro';
import { ContextForm, ContextData } from './components/ContextForm';
import { QuestionCard } from './components/QuestionCard';
import { Layout } from './components/Layout';
import { Results } from './components/Results';

type Screen = 'intro' | 'context' | 'questions' | 'results';

function App() {
    const [screen, setScreen] = useState<Screen>('intro');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [context, setContext] = useState<ContextData | null>(null);

    // Computed state
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;

    const handleStart = () => {
        setScreen('context');
        window.scrollTo(0, 0);
    };

    const handleContextComplete = (data: ContextData) => {
        setContext(data);
        setScreen('questions');
        window.scrollTo(0, 0);
    };

    const handleAnswer = (optionId: string) => {
        // Save answer
        const newAnswers = { ...answers, [currentQuestion.id]: optionId };
        setAnswers(newAnswers);

        // Navigate
        if (isLastQuestion) {
            setScreen('results');
        } else {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        if (screen === 'context') {
            setScreen('intro');
        } else if (screen === 'questions') {
            if (isFirstQuestion) {
                setScreen('context');
            } else {
                setCurrentQuestionIndex((prev) => prev - 1);
            }
        }
        window.scrollTo(0, 0);
    };

    const handleRetake = () => {
        setAnswers({});
        setCurrentQuestionIndex(0);
        setScreen('intro');
        window.scrollTo(0, 0);
    };

    const insights = screen === 'results' ? calculateInsights(answers) : [];

    return (
        <Layout className="py-8" itemKey={screen}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <header className="mb-8 flex justify-between items-center px-4">
                    <div className="text-xl font-bold tracking-tight text-primary">SelfReflect</div>
                    {screen !== 'intro' && (
                        <div className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                            {screen === 'results' ? 'Complete' : 'Assessment'}
                        </div>
                    )}
                </header>

                {/* Main Content */}
                <main className="flex-grow w-full relative">
                    {screen === 'intro' && <Intro onStart={handleStart} />}

                    {screen === 'context' && (
                        <ContextForm
                            onComplete={handleContextComplete}
                            onBack={handleBack}
                        />
                    )}

                    {screen === 'questions' && (
                        <QuestionCard
                            question={currentQuestion}
                            currentNumber={currentQuestionIndex + 1}
                            totalQuestions={QUESTIONS.length}
                            onSelect={handleAnswer}
                            onBack={handleBack}
                        />
                    )}

                    {screen === 'results' && (
                        <Results
                            insights={insights}
                            onRetake={handleRetake}
                            context={context}
                        />
                    )}
                </main>

                {/* Footer */}
                <footer className="mt-12 text-center text-slate-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} Self-Reflection Tool. Private & local.</p>
                </footer>
            </div>
        </Layout>
    );
}

export default App;
