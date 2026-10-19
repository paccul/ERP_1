<?php

namespace App\Enums;

enum SiteStatus: string implements LabeledEnum
{
    case Active = 'active';
    case Inactive = 'inactive';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Aktif',
            self::Inactive => 'Nonaktif',
        };
    }
}
