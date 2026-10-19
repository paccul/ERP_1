import React from 'react';
import { 
    TextField as AriaTextField, 
    TextFieldProps as AriaTextFieldProps, 
    Label, 
    Input, 
    Text,
    FieldError
} from 'react-aria-components';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TextFieldProps extends AriaTextFieldProps {
    label?: string;
    description?: string;
    errorMessage?: string | ((validation: any) => string);
    isPending?: boolean;
    className?: string;
}

export function TextField({
    label,
    description,
    errorMessage,
    isPending,
    className,
    ...props
}: TextFieldProps) {
    return (
        <AriaTextField {...props} isInvalid={props.isInvalid || !!errorMessage} className={cn('flex flex-col gap-1', className)}>
            {label && <Label className="text-sm font-bold text-fg">{label}</Label>}
            <div className="relative">
                <Input 
                    className={cn(
                        'w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none transition-colors',
                        'hover:border-fg',
                        'focus:border-accent focus:ring-1 focus:ring-accent',
                        'data-[disabled]:bg-sunken data-[disabled]:text-fg-disabled data-[disabled]:cursor-not-allowed',
                        'data-[invalid]:border-danger data-[invalid]:focus:border-danger data-[invalid]:focus:ring-danger'
                    )}
                />
                {isPending && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="size-4 animate-spin text-fg-muted" />
                    </div>
                )}
            </div>
            {description && <Text slot="description" className="text-xs text-fg-muted">{description}</Text>}
            {errorMessage && <div className="text-xs text-danger">{errorMessage as string}</div>}
            <FieldError className="text-xs text-danger" />
        </AriaTextField>
    );
}
