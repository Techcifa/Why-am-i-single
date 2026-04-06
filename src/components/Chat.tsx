import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ContextData } from './ContextForm';

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

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatProps {
    answers: Record<string, string>;
    context: ContextData | null;
    results: GeneratedResults | null;
    isResultsLoading: boolean;
}

const INITIAL_MESSAGE: ChatMessage = {
    role: 'assistant',
    content: "I've read your reflection. What would you like to dig into?",
};

export function Chat({ answers, context, results, isResultsLoading }: ChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading, isOpen]);

    if (!results) {
        return null;
    }

    const handleToggle = () => {
        if (isResultsLoading) {
            return;
        }

        setIsOpen((previous) => !previous);
    };

    const handleSubmit = async () => {
        const trimmedInput = input.trim();

        if (!trimmedInput || isLoading || !context || !results) {
            return;
        }

        const nextMessages: ChatMessage[] = [
            ...messages,
            { role: 'user', content: trimmedInput },
        ];

        setMessages(nextMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: nextMessages,
                    context,
                    answers,
                    results,
                }),
            });

            if (!response.ok) {
                throw new Error('Chat request failed');
            }

            const payload = await response.json();
            const reply = typeof payload?.reply === 'string' && payload.reply.trim()
                ? payload.reply.trim()
                : "I'm having trouble connecting right now. Try again in a moment.";

            setMessages((previous) => [
                ...previous,
                { role: 'assistant', content: reply },
            ]);
        } catch {
            setMessages((previous) => [
                ...previous,
                { role: 'assistant', content: 'Something went wrong. Try again.' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void handleSubmit();
        }
    };

    return (
        <div>
            <Button
                variant="ghost"
                onClick={handleToggle}
                disabled={isResultsLoading}
                title={isResultsLoading ? 'Available once your results load' : undefined}
                className="mx-auto flex"
            >
                {isOpen ? (
                    'Close chat'
                ) : (
                    <>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat with your coach
                    </>
                )}
            </Button>

            {isOpen && (
                <div className="mt-4">
                    <Card className="p-0 overflow-hidden">
                        <div className="max-h-96 overflow-y-auto px-4 py-4 md:px-6 md:py-6 space-y-4">
                            {messages.map((message, index) => (
                                <div
                                    key={`${message.role}-${index}`}
                                    className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                                >
                                    <div
                                        className={
                                            message.role === 'user'
                                                ? 'max-w-[85%] ml-auto rounded-2xl rounded-tr-none bg-primary px-4 py-3 text-sm text-white whitespace-pre-wrap'
                                                : 'max-w-[85%] rounded-2xl rounded-tl-none bg-slate-50 px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap'
                                        }
                                    >
                                        {message.content}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                        <div className="flex items-center gap-1">
                                            {[0, 1, 2].map((dot) => (
                                                <span
                                                    key={dot}
                                                    className="h-2 w-2 rounded-full bg-slate-400 animate-pulse"
                                                    style={{ animationDelay: `${dot * 0.2}s` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={bottomRef} />
                        </div>

                        <div className="border-t border-slate-100 px-4 py-4 md:px-6">
                            <div className="flex items-end gap-3">
                                <textarea
                                    rows={1}
                                    value={input}
                                    onChange={(event) => setInput(event.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isLoading}
                                    placeholder="Ask a follow-up about your reflection..."
                                    className="min-h-[44px] flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:bg-slate-50 disabled:text-slate-400"
                                />
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => void handleSubmit()}
                                    disabled={isLoading || !input.trim()}
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Send
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
