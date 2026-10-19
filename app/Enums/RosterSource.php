<?php

namespace App\Enums;

enum RosterSource: string implements LabeledEnum
{
    case Plot = 'plot';
    case Bko = 'bko';

    public function label(): string
    {
        return match ($this) {
            self::Plot => 'Plotting',
            self::Bko => 'BKO',
        };
    }
}
