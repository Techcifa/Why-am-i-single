import { useMemo, useState } from 'react';
import { QUESTIONS } from './data/questions';
import { Intro } from './components/Intro';
import { ContextForm, ContextData } from './components/ContextForm';
import { QuestionCard } from './components/QuestionCard';
import { Layout } from './components/Layout';
import { Results } from './components/Results';
import { getNextQuestion } from './utils/aiQuestions';

type Screen = 'intro' | 'context' | 'quiz';
type QuizState = 'idle' | 'loading_question' | 'answering' | 'loading_results' | 'results';

function App() {
    const [screen, setScreen] = useState<Screen>('intro');
    const [state, setState] = useState<QuizState>('idle');
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [context, setContext] = useState<ContextData | null>(null);
    const [questionOrder, setQuestionOrder] = useState<string[]>([]);
    const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);

    const currentQuestion = useMemo(
        () => QUESTIONS.find((question) => question.id === currentQuestionId) ?? null,
        [currentQuestionId]
    );

    const handleStart = () => {
        setScreen('context');
        window.scrollTo(0, 0);
    };

    const handleContextComplete = (data: ContextData) => {
        const firstQuestion = QUESTIONS[0] ?? null;

        setContext(data);
        setAnswers({});
        setQuestionOrder(firstQuestion ? [firstQuestion.id] : []);
        setCurrentQuestionId(firstQuestion?.id ?? null);
        setScreen('quiz');
        setState(firstQuestion ? 'answering' : 'loading_results');
        window.scrollTo(0, 0);
    };

    const handleAnswer = async (optionId: string) => {
        if (!currentQuestion || !context || state !== 'answering') {
            return;
        }

        const nextAnswers = {
            ...answers,
            [currentQuestion.id]: optionId,
        };
        const nextAskedCount = questionOrder.length;

        setAnswers(nextAnswers);
        window.scrollTo(0, 0);

        if (nextAskedCount >= 8) {
            setState('loading_results');
            return;
        }

        setState('loading_question');

        const nextQuestion = await getNextQuestion({
            answers: nextAnswers,
            context,
            askedQuestionIds: questionOrder,
        });

        if (!nextQuestion) {
            setState('loading_results');
            return;
        }

        setQuestionOrder((previous) => [...previous, nextQuestion.id]);
        setCurrentQuestionId(nextQuestion.id);
        setState('answering');
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        if (screen === 'context') {
            setScreen('intro');
            window.scrollTo(0, 0);
            return;
        }

        if (screen !== 'quiz') {
            return;
        }

        if (questionOrder.length <= 1) {
            setScreen('context');
            setState('idle');
            setCurrentQuestionId(null);
            setQuestionOrder([]);
            setAnswers({});
            window.scrollTo(0, 0);
            return;
        }

        const previousQuestionId = questionOrder[questionOrder.length - 2];
        const currentAnswerKey = currentQuestionId ?? '';

        setQuestionOrder((previous) => previous.slice(0, -1));
        setCurrentQuestionId(previousQuestionId);
        setState('answering');

        if (currentAnswerKey) {
            setAnswers((previous) => {
                const updatedAnswers = { ...previous };
                delete updatedAnswers[currentAnswerKey];
                return updatedAnswers;
            });
        }

        window.scrollTo(0, 0);
    };

    const handleResultsReady = () => {
        setState('results');
    };

    const handleRetake = () => {
        setAnswers({});
        setContext(null);
        setQuestionOrder([]);
        setCurrentQuestionId(null);
        setScreen('intro');
        setState('idle');
        window.scrollTo(0, 0);
    };

    const totalQuestions = Math.min(8, QUESTIONS.length);
    const currentNumber = Math.min(questionOrder.length || 1, totalQuestions);

    return (
        <Layout className="py-8" itemKey={`${screen}-${state}`}>
            <div className="flex flex-col h-full">
                <header className="mb-8 flex justify-between items-center px-4">
                    <div className="text-xl font-bold tracking-tight text-primary">SelfReflect</div>
                    {screen !== 'intro' && (
                        <div className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                            {state === 'results' || state === 'loading_results' ? 'Complete' : 'Assessment'}
                        </div>
                    )}
                </header>

                <main className="flex-grow w-full relative">
                    {screen === 'intro' && <Intro onStart={handleStart} />}

                    {screen === 'context' && (
                        <ContextForm
                            onComplete={handleContextComplete}
                            onBack={handleBack}
                        />
                    )}

                    {screen === 'quiz' && currentQuestion && state !== 'loading_results' && state !== 'results' && (
                        <QuestionCard
                            question={currentQuestion}
                            currentNumber={currentNumber}
                            totalQuestions={totalQuestions}
                            onSelect={handleAnswer}
                            onBack={handleBack}
                            isLoading={state === 'loading_question'}
                        />
                    )}

                    {screen === 'quiz' && (state === 'loading_results' || state === 'results') && (
                        <Results
                            answers={answers}
                            onRetake={handleRetake}
                            context={context}
                            isLoading={state === 'loading_results'}
                            onReady={handleResultsReady}
                        />
                    )}
                </main>

                <footer className="mt-12 text-center text-slate-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} Self-Reflection Tool. Private & local.</p>
                </footer>
            </div>
        </Layout>
    );
}

export default App;
