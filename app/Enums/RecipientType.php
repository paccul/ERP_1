<?php

namespace App\Enums;

enum RecipientType: string implements LabeledEnum
{
    case Personnel = 'personnel';
    case Site = 'site';

    public function label(): string
    {
        return match ($this) {
            self::Personnel => 'Personel',
            self::Site => 'Lokasi Jaga',
        };
    }
}
