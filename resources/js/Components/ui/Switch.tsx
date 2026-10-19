import React from 'react';
import { 
    Switch as AriaSwitch, 
    SwitchProps as AriaSwitchProps,
    FieldError
} from 'react-aria-components';
import { cn } from '@/lib/utils';

export interface SwitchProps extends AriaSwitchProps {
    description?: string;
    className?: string;
}

export function Switch({
    children,
    description,
    className,
    ...props
}: SwitchProps) {
    return (
        <AriaSwitch 
            {...props} 
            className={cn(
                'group flex items-center gap-2 text-sm transition-colors',
                'data-[disabled]:cursor-not-allowed data-[disabled]:text-fg-disabled',
                className
            )}
        >
            {({ isSelected, isDisabled, isFocusVisible, isInvalid }) => (
                <>
                    <div className={cn(
                        'flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors',
                        isFocusVisible ? 'ring-2 ring-accent ring-offset-2 ring-offset-canvas' : '',
                        isInvalid ? 'border-danger' : '',
                        isSelected && !isDisabled ? 'bg-accent' : '',
                        !isSelected && !isDisabled ? 'bg-line-input group-hover:bg-fg' : '',
                        isDisabled ? 'bg-sunken border-line-subtle' : ''
                    )}>
                        <span className={cn(
                            'size-4 rounded-full bg-white shadow-sm transition-transform',
                            isSelected ? 'translate-x-4' : 'translate-x-0',
                            isDisabled && 'bg-fg-disabled opacity-50'
                        )} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className={cn('text-fg', isDisabled && 'text-fg-disabled')}>
                            {typeof children === 'function' ? children({ isSelected, isDisabled, isFocusVisible, isInvalid, defaultChildren: null }) : children}
                        </span>
                        {description && (
                            <span className="text-xs text-fg-muted">{description}</span>
                        )}
                        <FieldError className="text-xs text-danger" />
                    </div>
                </>
            )}
        </AriaSwitch>
    );
}
