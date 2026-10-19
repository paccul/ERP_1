<?php

namespace App\Enums;

enum AccountCategory: string implements LabeledEnum
{
    case Asset = 'asset';
    case Liability = 'liability';
    case Equity = 'equity';
    case Revenue = 'revenue';
    case Expense = 'expense';

    public function label(): string
    {
        return match ($this) {
            self::Asset => 'Aset',
            self::Liability => 'Liabilitas',
            self::Equity => 'Ekuitas',
            self::Revenue => 'Pendapatan',
            self::Expense => 'Beban',
        };
    }

    public function defaultNormalBalance(): NormalBalance
    {
        return match ($this) {
            self::Asset, self::Expense => NormalBalance::Debit,
            self::Liability, self::Equity, self::Revenue => NormalBalance::Credit,
        };
    }
}
