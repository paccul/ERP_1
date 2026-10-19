import React from 'react';

// For a real toast system, you'd integrate react-hot-toast or sonner. 
// This is just a base component that can be used by those libraries or a custom provider.
// Given PRD mentions "Toast region React Aria", we can implement a basic visual.

import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Button } from './Button';

export interface ToastProps {
    variant?: 'success' | 'error';
    title: string;
    description?: string;
    onClose?: () => void;
}

export function Toast({ variant = 'success', title, description, onClose }: ToastProps) {
    return (
        <div 
            className={cn(
                'flex gap-3 p-4 bg-raised border border-line-subtle shadow-overlay rounded-md min-w-[300px] pointer-events-auto',
                variant === 'error' && 'border-danger/50'
            )}
            role="alert"
        >
            <div className="shrink-0 mt-0.5">
                {variant === 'success' ? (
                    <CheckCircle2 className="size-5 text-success" />
                ) : (
                    <AlertCircle className="size-5 text-danger" />
                )}
            </div>
            <div className="flex-1">
                <p className="text-sm font-bold text-fg-strong">{title}</p>
                {description && <p className="text-sm text-fg-muted mt-1">{description}</p>}
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="shrink-0 text-fg-muted hover:text-fg-strong outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm h-fit p-1"
                >
                    <X className="size-4" />
                </button>
            )}
        </div>
    );
}
