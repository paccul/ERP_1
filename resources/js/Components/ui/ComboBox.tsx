import React from 'react';
import { 
    ComboBox as AriaComboBox, 
    ComboBoxProps as AriaComboBoxProps,
    Label,
    Input,
    Button,
    Popover,
    ListBox,
    ListBoxItem,
    FieldError,
    Text,
    Group
} from 'react-aria-components';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ComboBoxProps<T extends object> extends Omit<AriaComboBoxProps<T>, 'children'> {
    label?: string;
    description?: string;
    items?: Iterable<T>;
    children: React.ReactNode | ((item: T) => React.ReactNode);
    className?: string;
}

export function ComboBox<T extends object>({
    label,
    description,
    className,
    items,
    children,
    ...props
}: ComboBoxProps<T>) {
    return (
        <AriaComboBox {...props} className={cn('flex flex-col gap-1', className)}>
            {label && <Label className="text-sm font-bold text-fg">{label}</Label>}
            <Group className={cn(
                'flex items-center justify-between w-full bg-canvas border border-line-input rounded-sm overflow-hidden outline-none transition-colors',
                'focus-within:border-accent focus-within:ring-1 focus-within:ring-accent',
                'data-[disabled]:bg-sunken data-[disabled]:text-fg-disabled data-[disabled]:cursor-not-allowed',
                'data-[invalid]:border-danger data-[invalid]:focus-within:border-danger data-[invalid]:focus-within:ring-danger'
            )}>
                <Input 
                    className="flex-1 min-w-0 bg-transparent px-3 py-2 text-sm text-fg-strong outline-none"
                />
                <Button className="px-2 outline-none">
                    <ChevronDown aria-hidden="true" className="size-4 text-fg-muted" />
                </Button>
            </Group>
            {description && <Text slot="description" className="text-xs text-fg-muted">{description}</Text>}
            <FieldError className="text-xs text-danger" />
            <Popover className="max-h-60 w-[--trigger-width] overflow-auto rounded-sm bg-raised border border-line-subtle shadow-overlay z-50">
                <ListBox items={items} className="p-1 outline-none">
                    {children}
                </ListBox>
            </Popover>
        </AriaComboBox>
    );
}

export function ComboBoxItem(props: any) {
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
