import React from 'react';
import { 
    DateRangePicker as AriaDateRangePicker, 
    DateRangePickerProps as AriaDateRangePickerProps,
    Label,
    Group,
    Button,
    Popover,
    Dialog,
    RangeCalendar,
    Heading,
    CalendarGrid,
    CalendarGridHeader,
    CalendarHeaderCell,
    CalendarGridBody,
    CalendarCell,
    DateInput,
    DateSegment,
    FieldError,
    Text,
    DateValue
} from 'react-aria-components';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DateRangePickerProps<T extends DateValue> extends AriaDateRangePickerProps<T> {
    label?: string;
    description?: string;
    className?: string;
}

export function DateRangePicker<T extends DateValue>({
    label,
    description,
    className,
    ...props
}: DateRangePickerProps<T>) {
    return (
        <AriaDateRangePicker {...props} className={cn('flex flex-col gap-1', className)}>
            {label && <Label className="text-sm font-bold text-fg">{label}</Label>}
            <Group className={cn(
                'flex items-center w-full bg-canvas border border-line-input rounded-sm overflow-hidden outline-none transition-colors',
                'focus-within:border-accent focus-within:ring-1 focus-within:ring-accent',
                'data-[disabled]:bg-sunken data-[disabled]:text-fg-disabled data-[disabled]:cursor-not-allowed',
                'data-[invalid]:border-danger data-[invalid]:focus-within:border-danger data-[invalid]:focus-within:ring-danger'
            )}>
                <DateInput slot="start" className="flex-1 flex pl-3 py-2 text-sm text-fg-strong outline-none">
                    {(segment) => (
                        <DateSegment 
                            segment={segment} 
                            className="px-0.5 rounded-sm focus:bg-accent focus:text-fg-on-accent outline-none focus:caret-transparent data-[placeholder]:text-fg-muted" 
                        />
                    )}
                </DateInput>
                <span aria-hidden="true" className="px-2 text-fg-muted">
                    <Minus className="size-3" />
                </span>
                <DateInput slot="end" className="flex-1 flex pr-3 py-2 text-sm text-fg-strong outline-none">
                    {(segment) => (
                        <DateSegment 
                            segment={segment} 
                            className="px-0.5 rounded-sm focus:bg-accent focus:text-fg-on-accent outline-none focus:caret-transparent data-[placeholder]:text-fg-muted" 
                        />
                    )}
                </DateInput>
                <Button className="px-2 outline-none border-l border-line-subtle ml-1">
                    <CalendarIcon aria-hidden="true" className="size-4 text-fg-muted" />
                </Button>
            </Group>
            {description && <Text slot="description" className="text-xs text-fg-muted">{description}</Text>}
            <FieldError className="text-xs text-danger" />
            
            <Popover className="max-w-[280px] p-3 rounded-sm bg-raised border border-line-subtle shadow-overlay z-50">
                <Dialog className="outline-none">
                    <RangeCalendar>
                        <header className="flex items-center w-full pb-2 mb-2 border-b border-line-subtle">
                            <Button slot="previous" className="p-1 rounded-sm hover:bg-overlay outline-none focus-visible:ring-2 focus-visible:ring-accent">
                                <ChevronLeft className="size-4" />
                            </Button>
                            <Heading className="flex-1 text-center text-sm font-bold text-fg-strong" />
                            <Button slot="next" className="p-1 rounded-sm hover:bg-overlay outline-none focus-visible:ring-2 focus-visible:ring-accent">
                                <ChevronRight className="size-4" />
                            </Button>
                        </header>
                        <CalendarGrid>
                            <CalendarGridHeader>
                                {(day) => <CalendarHeaderCell className="text-xs text-fg-muted font-normal pb-2">{day}</CalendarHeaderCell>}
                            </CalendarGridHeader>
                            <CalendarGridBody>
                                {(date) => (
                                    <CalendarCell 
                                        date={date} 
                                        className={cn(
                                            'size-8 flex items-center justify-center rounded-sm text-sm outline-none transition-colors cursor-pointer relative',
                                            'hover:bg-overlay',
                                            'data-[selected]:bg-accent/20',
                                            'data-[selection-start]:bg-accent data-[selection-start]:text-fg-on-accent',
                                            'data-[selection-end]:bg-accent data-[selection-end]:text-fg-on-accent',
                                            'data-[outside-month]:text-fg-muted',
                                            'data-[disabled]:text-fg-disabled data-[disabled]:cursor-not-allowed',
                                            'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-raised'
                                        )} 
                                    />
                                )}
                            </CalendarGridBody>
                        </CalendarGrid>
                    </RangeCalendar>
                </Dialog>
            </Popover>
        </AriaDateRangePicker>
    );
}
