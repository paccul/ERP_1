<?php

use App\Support\Money;

it('menjumlah dan mengurang tanpa selisih float', function () {
    expect(Money::add('0.10', '0.20'))->toBe('0.30')
        ->and(Money::subtract('1000000.00', '0.01'))->toBe('999999.99')
        ->and(Money::sum(['0.10', '0.20', '0.30']))->toBe('0.60');
});

it('mengalikan dengan pembulatan setengah menjauhi nol', function () {
    expect(Money::multiply('10.005', '1'))->toBe('10.01')
        ->and(Money::multiply('-10.005', '1'))->toBe('-10.01')
        ->and(Money::multiply('3500000.00', '4'))->toBe('14000000.00');
});

it('menghitung persentase PPN 11 persen', function () {
    expect(Money::percentage('14000000.00', '11'))->toBe('1540000.00')
        ->and(Money::percentage('999.99', '11'))->toBe('110.00');
});

it('membagi dengan pembulatan dan menolak pembagi nol', function () {
    expect(Money::divide('100.00', '3'))->toBe('33.33');
    Money::divide('100.00', '0');
})->throws(InvalidArgumentException::class);

it('membandingkan dan menguji tanda nilai', function () {
    expect(Money::equals('5', '5.00'))->toBeTrue()
        ->and(Money::compare('1.00', '2.00'))->toBe(-1)
        ->and(Money::isZero('0.001'))->toBeTrue()
        ->and(Money::isPositive('0.01'))->toBeTrue()
        ->and(Money::isNegative('-0.01'))->toBeTrue()
        ->and(Money::negate('5.00'))->toBe('-5.00')
        ->and(Money::absolute('-5.00'))->toBe('5.00');
});

it('menolak teks yang bukan angka', function () {
    Money::add('abc', '1');
})->throws(InvalidArgumentException::class);
