import React from 'react';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    href?: string;
}

export function Card({ className, href, children, ...props }: CardProps) {
    const Component = href ? Link : 'div';
    
    return (
        <Component
            href={href as any}
            className={cn(
                'block bg-raised rounded-md border border-line-subtle shadow-sm outline-none transition-colors overflow-hidden',
                href && 'hover:bg-overlay focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent',
                className
            )}
            {...props as any}
        >
            {children}
        </Component>
    );
}
