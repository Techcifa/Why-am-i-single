import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className }: CardProps) {
    return (
        <div className={twMerge(
            "bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 md:p-10 border border-slate-50",
            className
        )}>
            {children}
        </div>
    );
}
