import React from 'react';
import { 
    Select as AriaSelect, 
    SelectProps as AriaSelectProps,
    SelectValue,
    Label,
    Button,
    Popover,
    ListBox,
    ListBoxItem,
    FieldError,
    Text
} from 'react-aria-components';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectProps<T extends object> extends Omit<AriaSelectProps<T>, 'children'> {
    label?: string;
    errorMessage?: string | ((validation: any) => string);
    description?: string;
    items?: Iterable<T>;
    children: React.ReactNode | ((item: T) => React.ReactNode);
    className?: string;
}

export function Select<T extends object>({
    label,
    description,
    className,
    items,
    children,
    ...props
}: SelectProps<T>) {
    return (
        <AriaSelect {...props} isInvalid={props.isInvalid || !!props.errorMessage} className={cn('flex flex-col gap-1', className)}>
            {label && <Label className="text-sm font-bold text-fg">{label}</Label>}
            <Button className={cn(
                'flex items-center justify-between w-full bg-canvas border border-line-input rounded-sm px-3 py-2 text-sm text-fg-strong outline-none transition-colors',
                'hover:border-fg',
                'focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent',
                'data-[disabled]:bg-sunken data-[disabled]:text-fg-disabled data-[disabled]:cursor-not-allowed',
                'data-[invalid]:border-danger data-[invalid]:focus-visible:border-danger data-[invalid]:focus-visible:ring-danger'
            )}>
                <SelectValue className="truncate flex-1 text-left placeholder-shown:text-fg-muted" />
                <ChevronDown aria-hidden="true" className="size-4 ml-2 shrink-0 text-fg-muted" />
            </Button>
            {description && <Text slot="description" className="text-xs text-fg-muted">{description}</Text>}
            {props.errorMessage && <div className="text-xs text-danger">{props.errorMessage as string}</div>}
            <FieldError className="text-xs text-danger" />
            <Popover className="max-h-60 w-[--trigger-width] overflow-auto rounded-sm bg-raised border border-line-subtle shadow-overlay z-50">
                <ListBox items={items} className="p-1 outline-none">
                    {children}
                </ListBox>
            </Popover>
        </AriaSelect>
    );
}

export function SelectItem(props: any) {
    return (
        <ListBoxItem
            {...props}
            className={cn(
                'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-fg outline-none transition-colors',
                'data-[focused]:bg-overlay data-[focused]:text-fg-strong',
                'data-[selected]:text-accent',
                'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed'
            )}
        >
            {({ isSelected }) => (
                <>
                    <span className="flex-1 truncate">{props.children}</span>
                    {isSelected && <Check className="size-4 ml-2 shrink-0" />}
                </>
            )}
        </ListBoxItem>
    );
}
