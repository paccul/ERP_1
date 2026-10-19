<?php

namespace App\Enums;

enum PersonnelStatus: string implements LabeledEnum
{
    case Active = 'active';
    case Leave = 'leave';
    case Inactive = 'inactive';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Aktif',
            self::Leave => 'Cuti',
            self::Inactive => 'Nonaktif',
        };
    }
}
