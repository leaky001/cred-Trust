"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={cn(
                "relative flex size-9 items-center justify-center rounded-full",
                "border border-border/60 dark:border-white/[0.08]",
                "bg-surface/80 dark:bg-white/5",
                "text-gray-600 dark:text-gray-400",
                "transition-all duration-200 hover:text-gray-900 dark:hover:text-white",
                "hover:bg-gray-100 dark:hover:bg-white/10",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
            )}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={isDark ? "moon" : "sun"}
                    initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 30 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                >
                    {isDark ? (
                        <Sun className="size-4 text-amber-400" />
                    ) : (
                        <Moon className="size-4" />
                    )}
                </motion.div>
            </AnimatePresence>
        </button>
    );
}
