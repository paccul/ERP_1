import React from 'react';
import { 
    Modal as AriaModal, 
    ModalOverlay as AriaModalOverlay, 
    Dialog, 
    Heading, 
    Button as AriaButton 
} from 'react-aria-components';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    title: string;
    children: React.ReactNode;
    className?: string;
    isDismissable?: boolean;
}

export function Modal({ isOpen, onOpenChange, title, children, className, isDismissable = true }: ModalProps) {
    return (
        <AriaModalOverlay 
            isOpen={isOpen} 
            onOpenChange={onOpenChange}
            isDismissable={isDismissable}
            className={({ isEntering, isExiting }) => cn(
                'fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm flex items-center justify-center p-4',
                isEntering && 'animate-in fade-in duration-normal ease-out',
                isExiting && 'animate-out fade-out duration-fast ease-in'
            )}
        >
            <AriaModal 
                className={({ isEntering, isExiting }) => cn(
                    'w-full max-w-lg bg-raised border border-line-subtle shadow-overlay rounded-lg outline-none overflow-hidden',
                    isEntering && 'animate-in zoom-in-95 duration-normal ease-out',
                    isExiting && 'animate-out zoom-out-95 duration-fast ease-in',
                    className
                )}
            >
                <Dialog className="outline-none flex flex-col max-h-[85vh]">
                    {({ close }) => (
                        <>
                            <header className="flex items-center justify-between p-4 border-b border-line-subtle">
                                <Heading slot="title" className="text-lg font-bold text-fg-strong">
                                    {title}
                                </Heading>
                                <AriaButton 
                                    onPress={close}
                                    className="p-1 text-fg-muted hover:bg-overlay rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                >
                                    <X className="size-5" />
                                </AriaButton>
                            </header>
                            <div className="p-4 overflow-y-auto">
                                {children}
                            </div>
                        </>
                    )}
                </Dialog>
            </AriaModal>
        </AriaModalOverlay>
    );
}
