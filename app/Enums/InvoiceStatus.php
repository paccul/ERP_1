<?php

namespace App\Enums;

enum InvoiceStatus: string implements LabeledEnum
{
    case Draft = 'draft';
    case Issued = 'issued';
    case Paid = 'paid';
    case Void = 'void';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draf',
            self::Issued => 'Terbit',
            self::Paid => 'Lunas',
            self::Void => 'Batal',
        };
    }

    /**
     * Siklus hidup: draf → terbit → lunas, dan draf/terbit/lunas → batal.
     *
     * @return list<self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Draft => [self::Issued, self::Void],
            self::Issued => [self::Paid, self::Void],
            self::Paid => [self::Void],
            self::Void => [],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }
}
