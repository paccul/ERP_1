<?php

namespace App\Enums;

enum PayrollStatus: string implements LabeledEnum
{
    case Draft = 'draft';
    case Posted = 'posted';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draf',
            self::Posted => 'Terposting',
        };
    }
}
