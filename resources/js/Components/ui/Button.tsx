import React from 'react';
import { Button as AriaButton, ButtonProps as AriaButtonProps } from 'react-aria-components';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends AriaButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    isPending?: boolean;
    className?: string;
}

export function Button({ 
    variant = 'primary', 
    isPending, 
    children, 
    className, 
    ...props 
}: ButtonProps) {
    const variants = {
        primary: 'bg-accent text-fg-on-accent hover:bg-accent-hover data-[pressed]:bg-accent-pressed',
        secondary: 'bg-info-solid text-fg-on-solid hover:opacity-90 data-[pressed]:opacity-80',
        ghost: 'bg-transparent text-fg hover:bg-overlay hover:text-fg-strong data-[pressed]:bg-overlay',
        danger: 'bg-danger-solid text-fg-on-solid hover:opacity-90 data-[pressed]:opacity-80',
    };

    return (
        <AriaButton
            {...props}
            isDisabled={props.isDisabled || isPending}
            className={(renderProps) => cn(
                'relative inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-bold transition-colors outline-none',
                'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:ring-accent',
                'data-[disabled]:cursor-not-allowed data-[disabled]:bg-sunken data-[disabled]:text-fg-disabled data-[disabled]:border-line-subtle data-[disabled]:border',
                !renderProps.isDisabled && variants[variant],
                typeof className === 'function' ? className(renderProps) : className
            )}
        >
            {renderProps => (
                <>
                    {isPending && <Loader2 className="animate-spin size-4 absolute left-4" />}
                    <span className={cn(isPending && 'invisible')}>
                        {typeof children === 'function' ? children(renderProps) : children}
                    </span>
                    {/* Maintain width when loading by rendering children invisibly */}
                    {isPending && (
                        <span className="absolute flex items-center justify-center inset-0 gap-2">
                             <Loader2 className="animate-spin size-4" />
                             {typeof children === 'function' ? children(renderProps) : children}
                        </span>
                    )}
                </>
            )}
        </AriaButton>
    );
}
