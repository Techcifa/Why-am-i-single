import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
    children: ReactNode;
    className?: string;
    itemKey?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className = '', itemKey }) => {
    return (
        <div className="min-h-screen font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={itemKey || 'layout'}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`w-full max-w-md mx-auto relative ${className}`}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
