import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ variant = 'neutral', className, children, ...props }: BadgeProps) {
    const variants = {
        neutral: 'bg-overlay text-fg-strong',
        success: 'bg-success-soft text-success-soft-fg',
        warning: 'bg-accent-soft text-accent-soft-fg',
        danger: 'bg-danger-solid text-fg-on-solid',
        info: 'bg-info-solid text-fg-on-solid',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
