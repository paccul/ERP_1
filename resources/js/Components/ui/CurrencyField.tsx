import React from 'react';
import { 
    NumberField as AriaNumberField, 
    NumberFieldProps as AriaNumberFieldProps, 
    Label, 
    Input, 
    Text,
    FieldError,
    Group
} from 'react-aria-components';
import { cn } from '@/lib/utils';

export interface CurrencyFieldProps extends Omit<AriaNumberFieldProps, 'formatOptions'> {
    label?: string;
    description?: string;
    className?: string;
}

export function CurrencyField({
    label,
    description,
    className,
    ...props
}: CurrencyFieldProps) {
    return (
        <AriaNumberField 
            {...props} 
            formatOptions={{ style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }}
            className={cn('flex flex-col gap-1', className)}
        >
            {label && <Label className="text-sm font-bold text-fg">{label}</Label>}
            <Group className={cn(
                'w-full flex items-center bg-canvas border border-line-input rounded-sm text-sm outline-none transition-colors overflow-hidden',
                'focus-within:border-accent focus-within:ring-1 focus-within:ring-accent',
                'data-[disabled]:bg-sunken data-[disabled]:text-fg-disabled data-[disabled]:cursor-not-allowed',
                'data-[invalid]:border-danger data-[invalid]:focus-within:border-danger data-[invalid]:focus-within:ring-danger'
            )}>
                <Input 
                    className="flex-1 min-w-0 bg-transparent px-3 py-2 text-fg-strong outline-none tabular-nums text-right"
                />
            </Group>
            {description && <Text slot="description" className="text-xs text-fg-muted">{description}</Text>}
            <FieldError className="text-xs text-danger" />
        </AriaNumberField>
    );
}
