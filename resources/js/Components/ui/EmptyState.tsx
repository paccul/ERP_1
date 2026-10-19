import React from 'react';
import { FileSearch } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center p-8 sm:p-12 text-center border border-dashed border-line-input rounded-md bg-canvas', className)}>
            <div className="p-4 bg-sunken rounded-full text-fg-muted mb-4">
                <FileSearch className="size-8" />
            </div>
            <h3 className="text-lg font-bold text-fg-strong">{title}</h3>
            {description && (
                <p className="text-sm text-fg-muted mt-2 max-w-sm">{description}</p>
            )}
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </div>
    );
}
