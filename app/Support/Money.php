<?php

namespace App\Support;

use InvalidArgumentException;

/**
 * Aritmetika uang berbasis bcmath. Semua nilai berupa string desimal, tidak pernah float,
 * agar selisih pembulatan tidak merusak keseimbangan jurnal (debit = kredit).
 */
final class Money
{
    public const SCALE = 2;

    /** Skala kerja internal untuk perkalian/pembagian sebelum dibulatkan ke 2 desimal. */
    private const WORKING_SCALE = 8;

    public static function normalize(string|int $value): string
    {
        $text = trim((string) $value);

        if (preg_match('/^-?\d+(\.\d+)?$/', $text) !== 1) {
            throw new InvalidArgumentException("Nilai uang tidak valid: \"{$text}\".");
        }

        return self::round($text);
    }

    public static function add(string|int $left, string|int $right): string
    {
        return bcadd(self::normalize($left), self::normalize($right), self::SCALE);
    }

    public static function subtract(string|int $left, string|int $right): string
    {
        return bcsub(self::normalize($left), self::normalize($right), self::SCALE);
    }

    /** Perkalian dengan pembulatan setengah ke atas (half away from zero) ke 2 desimal. */
    public static function multiply(string|int $amount, string|int $factor): string
    {
        $product = bcmul(self::normalize($amount), self::plain($factor), self::WORKING_SCALE);

        return self::round($product);
    }

    /** Pembagian dengan pembulatan setengah ke atas ke 2 desimal. */
    public static function divide(string|int $amount, string|int $divisor): string
    {
        $divisorText = self::plain($divisor);

        if (bccomp($divisorText, '0', self::WORKING_SCALE) === 0) {
            throw new InvalidArgumentException('Pembagi tidak boleh nol.');
        }

        $quotient = bcdiv(self::normalize($amount), $divisorText, self::WORKING_SCALE);

        return self::round($quotient);
    }

    /** Persentase dari nilai, contoh: percentage('1000000.00', '11') = '110000.00'. */
    public static function percentage(string|int $amount, string|int $percent): string
    {
        return self::divide(self::multiply($amount, $percent), 100);
    }

    /**
     * Jumlahkan banyak nilai tanpa kehilangan presisi.
     *
     * @param  iterable<string|int>  $values
     */
    public static function sum(iterable $values): string
    {
        $total = '0.00';

        foreach ($values as $value) {
            $total = self::add($total, (string) $value);
        }

        return $total;
    }

    /** @return int -1, 0, atau 1 */
    public static function compare(string|int $left, string|int $right): int
    {
        return bccomp(self::normalize($left), self::normalize($right), self::SCALE);
    }

    public static function equals(string|int $left, string|int $right): bool
    {
        return self::compare($left, $right) === 0;
    }

    public static function isZero(string|int $value): bool
    {
        return self::compare($value, '0') === 0;
    }

    public static function isPositive(string|int $value): bool
    {
        return self::compare($value, '0') === 1;
    }

    public static function isNegative(string|int $value): bool
    {
        return self::compare($value, '0') === -1;
    }

    public static function negate(string|int $value): string
    {
        return bcmul(self::normalize($value), '-1', self::SCALE);
    }

    public static function absolute(string|int $value): string
    {
        $normalized = self::normalize($value);

        return str_starts_with($normalized, '-') ? self::negate($normalized) : $normalized;
    }

    /** Pembulatan setengah menjauhi nol ke jumlah desimal uang. */
    public static function round(string $value): string
    {
        $isNegative = str_starts_with($value, '-');
        $half = $isNegative ? '-0.005' : '0.005';

        $rounded = bcadd($value, $half, self::SCALE);

        // bcadd menghasilkan "-0.00" untuk nilai negatif yang terbulat ke nol; samakan jadi "0.00".
        return $rounded === '-0.00' ? '0.00' : $rounded;
    }

    /** Validasi dan kembalikan faktor/pembagi sebagai string desimal tanpa pembulatan uang. */
    private static function plain(string|int $value): string
    {
        $text = trim((string) $value);

        if (preg_match('/^-?\d+(\.\d+)?$/', $text) !== 1) {
            throw new InvalidArgumentException("Angka tidak valid: \"{$text}\".");
        }

        return $text;
    }
}
