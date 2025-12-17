

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="flex items-center justify-between h-full px-4 max-w-md mx-auto">
                <h1 className="text-xl font-bold text-gray-900">
                    <span className="text-primary-500">Lion</span>Pay
                </h1>
                <CountrySelector />
            </div>
        </header>
    );
}

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

function CountrySelector() {
    const { country, setCountry, countries } = useAppStore();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Only show on Home page
    if (location.pathname !== '/') return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
            >
                <span className="text-lg">{country.id === 'kr' ? '🇰🇷' : country.id === 'jp' ? '🇯🇵' : '🇺🇸'}</span>
                <span className="text-gray-700">{country.name}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                        >
                            {countries.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => {
                                        setCountry(c);
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                >
                                    <span className="text-xl">{c.id === 'kr' ? '🇰🇷' : c.id === 'jp' ? '🇯🇵' : '🇺🇸'}</span>
                                    <span className={`flex-1 text-sm ${country.id === c.id ? 'font-bold text-primary-600' : 'text-gray-700'}`}>
                                        {c.name}
                                    </span>
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

