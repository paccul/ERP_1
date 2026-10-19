<?php

namespace App\Enums;

enum CashFlowGroup: string implements LabeledEnum
{
    case Cash = 'cash';
    case Operating = 'operating';
    case Investing = 'investing';
    case Financing = 'financing';

    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Kas dan Setara Kas',
            self::Operating => 'Aktivitas Operasi',
            self::Investing => 'Aktivitas Investasi',
            self::Financing => 'Aktivitas Pendanaan',
        };
    }
}
