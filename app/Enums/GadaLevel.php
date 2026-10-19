<?php

namespace App\Enums;

enum GadaLevel: string implements LabeledEnum
{
    case Pratama = 'pratama';
    case Madya = 'madya';
    case Utama = 'utama';

    public function label(): string
    {
        return match ($this) {
            self::Pratama => 'Gada Pratama',
            self::Madya => 'Gada Madya',
            self::Utama => 'Gada Utama',
        };
    }
}
