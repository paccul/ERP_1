import React from 'react';
import { 
    Checkbox as AriaCheckbox, 
    CheckboxProps as AriaCheckboxProps,
    FieldError
} from 'react-aria-components';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends AriaCheckboxProps {
    description?: string;
    className?: string;
}

export function Checkbox({
    children,
    description,
    className,
    ...props
}: CheckboxProps) {
    return (
        <AriaCheckbox 
            {...props} 
            className={cn(
                'group flex items-start gap-2 text-sm transition-colors',
                'data-[disabled]:cursor-not-allowed data-[disabled]:text-fg-disabled',
                className
            )}
        >
            {({ isSelected, isIndeterminate, isDisabled, isFocusVisible, isInvalid }) => (
                <>
                    <div className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-sm border transition-colors mt-0.5',
                        isFocusVisible ? 'ring-2 ring-accent ring-offset-2 ring-offset-canvas' : '',
                        isInvalid ? 'border-danger' : 'border-line-input group-hover:border-fg',
                        (isSelected || isIndeterminate) && !isDisabled ? 'bg-accent border-accent text-fg-on-accent' : '',
                        isDisabled ? 'bg-sunken border-line-subtle text-fg-disabled' : 'bg-canvas text-transparent'
                    )}>
                        {isIndeterminate ? (
                            <Minus className="size-3.5 stroke-[3]" />
                        ) : isSelected ? (
                            <Check className="size-3.5 stroke-[3]" />
                        ) : null}
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className={cn('text-fg', isDisabled && 'text-fg-disabled')}>
                            {typeof children === 'function' ? children({ isSelected, isIndeterminate, isDisabled, isFocusVisible, isInvalid, defaultChildren: null }) : children}
                        </span>
                        {description && (
                            <span className="text-xs text-fg-muted">{description}</span>
                        )}
                        <FieldError className="text-xs text-danger" />
                    </div>
                </>
            )}
        </AriaCheckbox>
    );
}
