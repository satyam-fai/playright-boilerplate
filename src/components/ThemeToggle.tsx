"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
    const { isDarkMode, toggleDarkMode, colorTheme, setColorTheme, themeColors, isLoaded } = useTheme();

    const colorOptions = [
        { name: 'purple', color: '#9333ea' },
        { name: 'blue', color: '#3b82f6' },
        { name: 'green', color: '#10b981' },
        { name: 'red', color: '#ef4444' },
        { name: 'orange', color: '#f97316' },
        { name: 'pink', color: '#ec4899' },
    ] as const;

    // Don't render until theme is loaded to prevent hydration mismatch
    if (!isLoaded) {
        return (
            <div className="flex items-center space-x-4">
                <div className="w-11 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex space-x-1">
                    {colorOptions.map((option) => (
                        <div
                            key={option.name}
                            className="h-6 w-6 rounded-full border-2 border-gray-300 animate-pulse"
                            style={{ backgroundColor: option.color }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <motion.button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDarkMode
                        ? 'bg-gray-600 focus:ring-gray-500'
                        : 'bg-gray-200 focus:ring-gray-400'
                    }`}
                whileTap={{ scale: 0.95 }}
                aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
                <motion.span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    layout
                />
                <AnimatePresence mode="wait">
                    {isDarkMode ? (
                        <motion.svg
                            key="moon"
                            className="absolute left-1 h-3 w-3 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                        >
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </motion.svg>
                    ) : (
                        <motion.svg
                            key="sun"
                            className="absolute right-1 h-3 w-3 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                                clipRule="evenodd"
                            />
                        </motion.svg>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Color Theme Selector */}
            <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Theme:
                </span>
                <div className="flex space-x-1">
                    {colorOptions.map((option) => (
                        <motion.button
                            key={option.name}
                            onClick={() => setColorTheme(option.name)}
                            className={`h-6 w-6 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorTheme === option.name
                                    ? 'border-gray-800 dark:border-white'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}
                            style={{ backgroundColor: option.color }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label={`Switch to ${option.name} theme`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
