<?php

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

function insertClientAndSite(): int
{
    $clientId = DB::table('clients')->insertGetId(['name' => 'PT Mitra '.uniqid(), 'created_at' => now(), 'updated_at' => now()]);

    return DB::table('sites')->insertGetId([
        'client_id' => $clientId,
        'name' => 'Pos Utama',
        'guards_per_shift' => 2,
        'monthly_rate_per_guard' => '4500000.00',
        'status' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

function insertItem(string $stock = '10.00'): int
{
    return DB::table('items')->insertGetId([
        'code' => 'ITM-'.uniqid(),
        'name' => 'Seragam',
        'unit' => 'pcs',
        'stock_on_hand' => $stock,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

function insertJournalEntry(string $status = 'draft'): int
{
    return DB::table('journal_entries')->insertGetId([
        'number' => 'JU-'.uniqid(),
        'date' => '2026-10-01',
        'status' => $status,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

function insertAccount(string $code): int
{
    return DB::table('accounts')->insertGetId([
        'code' => $code,
        'name' => 'Akun '.$code,
        'category' => 'asset',
        'normal_balance' => 'debit',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

it('membuat seluruh tabel inti modul SET, SEC, PSB, LOG, FIN, dan ACC', function () {
    $tables = [
        'institution_settings', 'org_units', 'personnel', 'clients', 'sites', 'checkpoints', 'shifts',
        'roster_assignments', 'bko_requests', 'applicants', 'items', 'stock_movements', 'distributions',
        'distribution_lines', 'invoices', 'invoice_lines', 'invoice_payments', 'payroll_runs', 'payslips',
        'accounts', 'journal_entries', 'journal_lines', 'roles', 'permissions', 'activity_log',
    ];

    foreach ($tables as $table) {
        expect(Schema::hasTable($table))->toBeTrue("Tabel {$table} belum ada");
    }
});

it('memakai numeric(18,2) untuk kolom moneter dan numeric(12,2) untuk kuantitas', function () {
    $moneyColumns = [
        'journal_lines' => ['debit', 'credit'],
        'invoices' => ['subtotal', 'vat_amount', 'total'],
        'personnel' => ['base_salary', 'allowance'],
        'payslips' => ['net_pay', 'pph21'],
    ];

    foreach ($moneyColumns as $table => $columns) {
        foreach ($columns as $column) {
            expect(Schema::getColumnType($table, $column))->toBeIn(['numeric', 'decimal']);
        }
    }
});

it('menolak baris jurnal dengan debit dan kredit sekaligus terisi', function () {
    $entryId = insertJournalEntry();
    $accountId = insertAccount('1-9999');

    DB::table('journal_lines')->insert([
        'journal_entry_id' => $entryId, 'account_id' => $accountId, 'debit' => '10.00', 'credit' => '10.00',
        'created_at' => now(), 'updated_at' => now(),
    ]);
})->throws(QueryException::class);

it('menolak baris jurnal dengan debit dan kredit sama-sama nol', function () {
    $entryId = insertJournalEntry();
    $accountId = insertAccount('1-9998');

    DB::table('journal_lines')->insert([
        'journal_entry_id' => $entryId, 'account_id' => $accountId, 'debit' => '0.00', 'credit' => '0.00',
        'created_at' => now(), 'updated_at' => now(),
    ]);
})->throws(QueryException::class);

it('menerima baris jurnal satu sisi dengan nilai positif', function () {
    $entryId = insertJournalEntry();
    $accountId = insertAccount('1-9997');

    DB::table('journal_lines')->insert([
        'journal_entry_id' => $entryId, 'account_id' => $accountId, 'debit' => '25.50', 'credit' => '0.00',
        'created_at' => now(), 'updated_at' => now(),
    ]);

    expect(DB::table('journal_lines')->count())->toBe(1);
});

it('menolak stok barang bernilai negatif', function () {
    DB::table('items')->where('id', insertItem('5.00'))->update(['stock_on_hand' => '-1.00']);
})->throws(QueryException::class);

it('menolak penyisipan item dengan stok negatif', function () {
    insertItem('-0.01');
})->throws(QueryException::class);

it('menolak kartu stok yang diubah setelah dibuat', function () {
    $itemId = insertItem();
    $movementId = DB::table('stock_movements')->insertGetId([
        'item_id' => $itemId, 'type' => 'in', 'quantity' => '5.00', 'balance_after' => '15.00',
        'occurred_at' => now(), 'created_at' => now(), 'updated_at' => now(),
    ]);

    DB::table('stock_movements')->where('id', $movementId)->update(['note' => 'diubah']);
})->throws(QueryException::class);

it('menolak kartu stok yang dihapus', function () {
    $itemId = insertItem();
    $movementId = DB::table('stock_movements')->insertGetId([
        'item_id' => $itemId, 'type' => 'in', 'quantity' => '5.00', 'balance_after' => '15.00',
        'occurred_at' => now(), 'created_at' => now(), 'updated_at' => now(),
    ]);

    DB::table('stock_movements')->where('id', $movementId)->delete();
})->throws(QueryException::class);

it('menolak mutasi stok keluar dengan kuantitas nol', function () {
    DB::table('stock_movements')->insert([
        'item_id' => insertItem(), 'type' => 'out', 'quantity' => '0.00', 'balance_after' => '10.00',
        'occurred_at' => now(), 'created_at' => now(), 'updated_at' => now(),
    ]);
})->throws(QueryException::class);

it('menerima penyesuaian stok bertanda negatif', function () {
    DB::table('stock_movements')->insert([
        'item_id' => insertItem(), 'type' => 'adjust', 'quantity' => '-2.00', 'balance_after' => '8.00',
        'occurred_at' => now(), 'created_at' => now(), 'updated_at' => now(),
    ]);

    expect(DB::table('stock_movements')->count())->toBe(1);
});

it('membatasi institution_settings tepat satu baris', function () {
    DB::table('institution_settings')->insert(['id' => 1, 'name' => 'PT Garda', 'created_at' => now(), 'updated_at' => now()]);

    expect(DB::table('institution_settings')->count())->toBe(1);

    DB::table('institution_settings')->insert(['id' => 2, 'name' => 'PT Lain', 'created_at' => now(), 'updated_at' => now()]);
})->throws(QueryException::class);

it('menolak lokasi jaga dengan guards_per_shift kurang dari 1', function () {
    $clientId = DB::table('clients')->insertGetId(['name' => 'PT Klien', 'created_at' => now(), 'updated_at' => now()]);

    DB::table('sites')->insert([
        'client_id' => $clientId, 'name' => 'Pos', 'guards_per_shift' => 0, 'status' => 'active',
        'created_at' => now(), 'updated_at' => now(),
    ]);
})->throws(QueryException::class);

it('menolak status invoice di luar daftar enum', function () {
    $clientId = DB::table('clients')->insertGetId(['name' => 'PT Klien', 'created_at' => now(), 'updated_at' => now()]);

    DB::table('invoices')->insert([
        'number' => 'INV-1', 'client_id' => $clientId, 'period' => '2026-10', 'status' => 'bogus',
        'created_at' => now(), 'updated_at' => now(),
    ]);
})->throws(QueryException::class);

it('menolak baris invoice yang amount-nya tidak sama dengan guards x rate', function () {
    $siteId = insertClientAndSite();
    $clientId = DB::table('sites')->where('id', $siteId)->value('client_id');
    $invoiceId = DB::table('invoices')->insertGetId([
        'number' => 'INV-2', 'client_id' => $clientId, 'period' => '2026-10', 'status' => 'draft',
        'created_at' => now(), 'updated_at' => now(),
    ]);

    DB::table('invoice_lines')->insert([
        'invoice_id' => $invoiceId, 'site_id' => $siteId, 'description' => 'Jasa', 'guards' => 3,
        'rate' => '4500000.00', 'amount' => '1.00', 'created_at' => now(), 'updated_at' => now(),
    ]);
})->throws(QueryException::class);

it('menerima baris invoice dengan amount sama dengan guards x rate', function () {
    $siteId = insertClientAndSite();
    $clientId = DB::table('sites')->where('id', $siteId)->value('client_id');
    $invoiceId = DB::table('invoices')->insertGetId([
        'number' => 'INV-3', 'client_id' => $clientId, 'period' => '2026-10', 'status' => 'draft',
        'created_at' => now(), 'updated_at' => now(),
    ]);

    DB::table('invoice_lines')->insert([
        'invoice_id' => $invoiceId, 'site_id' => $siteId, 'description' => 'Jasa', 'guards' => 3,
        'rate' => '4500000.50', 'amount' => '13500001.50', 'created_at' => now(), 'updated_at' => now(),
    ]);

    expect(DB::table('invoice_lines')->count())->toBe(1);
});

it('melindungi relasi foreign key dari penghapusan induk', function () {
    $siteId = insertClientAndSite();
    $clientId = DB::table('sites')->where('id', $siteId)->value('client_id');

    DB::table('clients')->where('id', $clientId)->delete();
})->throws(QueryException::class);

it('menolak BKO dengan lokasi asal sama dengan lokasi tujuan dan periode terbalik', function () {
    $siteId = insertClientAndSite();
    $personnelId = DB::table('personnel')->insertGetId([
        'nik' => '3174000000000001', 'full_name' => 'Budi', 'status' => 'active',
        'created_at' => now(), 'updated_at' => now(),
    ]);
    $shiftId = DB::table('shifts')->insertGetId([
        'code' => 'pagi', 'name' => 'Pagi', 'starts_at' => '07:00', 'ends_at' => '15:00',
        'created_at' => now(), 'updated_at' => now(),
    ]);

    DB::table('bko_requests')->insert([
        'personnel_id' => $personnelId, 'from_site_id' => $siteId, 'to_site_id' => $siteId, 'shift_id' => $shiftId,
        'starts_on' => '2026-10-02', 'ends_on' => '2026-10-01', 'status' => 'pending',
        'created_at' => now(), 'updated_at' => now(),
    ]);
})->throws(QueryException::class);

it('menolak jadwal ganda untuk personel, tanggal, dan shift yang sama', function () {
    $siteId = insertClientAndSite();
    $personnelId = DB::table('personnel')->insertGetId([
        'nik' => '3174000000000002', 'full_name' => 'Sari', 'status' => 'active',
        'created_at' => now(), 'updated_at' => now(),
    ]);
    $shiftId = DB::table('shifts')->insertGetId([
        'code' => 'siang', 'name' => 'Siang', 'starts_at' => '15:00', 'ends_at' => '23:00',
        'created_at' => now(), 'updated_at' => now(),
    ]);
    $row = [
        'personnel_id' => $personnelId, 'site_id' => $siteId, 'shift_id' => $shiftId, 'date' => '2026-10-05',
        'source' => 'plot', 'created_at' => now(), 'updated_at' => now(),
    ];

    DB::table('roster_assignments')->insert($row);
    DB::table('roster_assignments')->insert($row);
})->throws(QueryException::class);
