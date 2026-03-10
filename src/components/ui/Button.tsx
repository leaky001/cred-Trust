"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 dark:bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 dark:hover:bg-primary-400 shadow-sm hover:shadow-glow-primary/60 focus-visible:ring-primary-500",
  secondary:
    "border border-border dark:border-white/10 bg-surface dark:bg-white/5 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 active:bg-gray-100 dark:active:bg-white/15 focus-visible:ring-gray-400",
  ghost:
    "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 focus-visible:ring-gray-400",
  destructive:
    "bg-red-600 text-white hover:bg-red-500 active:bg-red-700 focus-visible:ring-red-500 shadow-sm",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-small gap-1.5 min-w-[44px]",
  md: "h-10 px-5 text-body gap-2 min-w-[44px]",
  lg: "h-12 px-7 text-body-lg gap-2.5 min-w-[48px]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold",
          "transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "dark:focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "select-none",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
