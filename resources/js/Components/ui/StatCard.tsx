import React from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    href?: string;
    className?: string;
}

export function StatCard({ title, value, icon: Icon, href, className }: StatCardProps) {
    return (
        <Card href={href} className={cn('p-4 sm:p-6', className)}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-fg-muted uppercase tracking-wider">{title}</p>
                    <p className="text-3xl font-bold text-fg-strong mt-2">{value}</p>
                </div>
                <div className="p-3 bg-overlay rounded-full text-accent">
                    <Icon className="size-6" />
                </div>
            </div>
        </Card>
    );
}
