"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type ColorTheme = 'purple' | 'blue' | 'green' | 'red' | 'orange' | 'pink';

interface ThemeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    colorTheme: ColorTheme;
    setColorTheme: (theme: ColorTheme) => void;
    themeColors: {
        primary: string;
        primaryLight: string;
        primaryDark: string;
        accent: string;
    };
    isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const colorThemes = {
    purple: {
        primary: '#9333ea',
        primaryLight: '#a855f7',
        primaryDark: '#7c3aed',
        accent: '#e9d5ff',
    },
    blue: {
        primary: '#3b82f6',
        primaryLight: '#60a5fa',
        primaryDark: '#2563eb',
        accent: '#dbeafe',
    },
    green: {
        primary: '#10b981',
        primaryLight: '#34d399',
        primaryDark: '#059669',
        accent: '#d1fae5',
    },
    red: {
        primary: '#ef4444',
        primaryLight: '#f87171',
        primaryDark: '#dc2626',
        accent: '#fee2e2',
    },
    orange: {
        primary: '#f97316',
        primaryLight: '#fb923c',
        primaryDark: '#ea580c',
        accent: '#fed7aa',
    },
    pink: {
        primary: '#ec4899',
        primaryLight: '#f472b6',
        primaryDark: '#db2777',
        accent: '#fce7f3',
    },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [colorTheme, setColorTheme] = useState<ColorTheme>('purple');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Check for saved theme preferences or default to system preference
        const savedDarkMode = localStorage.getItem('darkMode');
        const savedColorTheme = localStorage.getItem('colorTheme') as ColorTheme;

        // Check system preference if no saved preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedDarkMode !== null) {
            setIsDarkMode(JSON.parse(savedDarkMode));
        } else {
            setIsDarkMode(systemPrefersDark);
        }

        if (savedColorTheme && colorThemes[savedColorTheme]) {
            setColorTheme(savedColorTheme);
        }

        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (!isLoaded) return;

        // Save theme preferences to localStorage
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
        localStorage.setItem('colorTheme', colorTheme);

        // Apply theme to document
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDarkMode, colorTheme, isLoaded]);

    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    const themeColors = colorThemes[colorTheme];

    return (
        <ThemeContext.Provider
            value={{
                isDarkMode,
                toggleDarkMode,
                colorTheme,
                setColorTheme,
                themeColors,
                isLoaded,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
