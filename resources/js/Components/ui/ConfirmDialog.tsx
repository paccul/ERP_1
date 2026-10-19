import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';

export interface ConfirmDialogProps {
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    isDestructive?: boolean;
    isPending?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onOpenChange,
    title,
    description,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    onConfirm,
    isDestructive = false,
    isPending = false,
}: ConfirmDialogProps) {
    return (
        <Modal 
            isOpen={isOpen} 
            onOpenChange={onOpenChange} 
            title={title} 
            isDismissable={!isPending}
            className="max-w-md"
        >
            <div className="flex flex-col gap-6">
                <div className="flex gap-4">
                    <div className="shrink-0 mt-0.5">
                        <AlertCircle className={`size-6 ${isDestructive ? 'text-danger' : 'text-accent'}`} />
                    </div>
                    <p className="text-sm text-fg whitespace-pre-wrap">{description}</p>
                </div>
                
                <div className="flex justify-end gap-3">
                    <Button 
                        variant="ghost" 
                        onPress={() => onOpenChange?.(false)}
                        isDisabled={isPending}
                    >
                        {cancelText}
                    </Button>
                    <Button 
                        variant={isDestructive ? 'danger' : 'primary'} 
                        onPress={onConfirm}
                        isPending={isPending}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
