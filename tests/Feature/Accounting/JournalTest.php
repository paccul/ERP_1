<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->seed(\Database\Seeders\RolePermissionSeeder::class);
    $this->seed(\Database\Seeders\ChartOfAccountsSeeder::class);

    $this->admin = User::factory()->create();
    $this->admin->assignRole(Role::findByName('Administrator Sistem'));

    $this->viewOnly = User::factory()->create();
    $this->viewOnly->assignRole(Role::findByName('Direksi'));

    $this->kasId       = DB::table('accounts')->where('code', '1001')->value('id');
    $this->piutangId   = DB::table('accounts')->where('code', '1101')->value('id');
});

function insertDraftJournal(array $override = []): int
{
    return DB::table('journal_entries')->insertGetId(array_merge([
        'number'      => 'JU-TEST-' . rand(1000, 9999),
        'date'        => now()->toDateString(),
        'source_type' => 'manual',
        'status'      => 'draft',
        'created_at'  => now(),
        'updated_at'  => now(),
    ], $override));
}

function insertBalancedLines(int $journalId, int $debitId, int $creditId, float $amount): void
{
    DB::table('journal_lines')->insert([
        ['journal_entry_id' => $journalId, 'account_id' => $debitId,  'debit' => $amount, 'credit' => 0,       'created_at' => now(), 'updated_at' => now()],
        ['journal_entry_id' => $journalId, 'account_id' => $creditId, 'debit' => 0,       'credit' => $amount, 'created_at' => now(), 'updated_at' => now()],
    ]);
}

// ── index ──────────────────────────────────────────────────────────────────────
describe('Jurnal – index', function () {

    it('admin dapat melihat daftar jurnal', function () {
        $this->actingAs($this->admin)
            ->get(route('journals.index'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('Accounting/Journals/Index'));
    });

    it('tamu diarahkan ke login', function () {
        $this->get(route('journals.index'))->assertRedirect('/login');
    });

    it('user tanpa permission mendapat 403', function () {
        $this->actingAs($this->viewOnly)
            ->get(route('journals.index'))
            ->assertForbidden();
    });
});

// ── store ──────────────────────────────────────────────────────────────────────
describe('Jurnal – store', function () {

    it('admin berhasil membuat draft jurnal seimbang', function () {
        $this->actingAs($this->admin)
            ->post(route('journals.store'), [
                'date'        => now()->toDateString(),
                'description' => 'Jurnal test seimbang',
                'lines'       => [
                    ['account_id' => $this->kasId,    'debit' => 500000, 'credit' => 0, 'memo' => null],
                    ['account_id' => $this->piutangId, 'debit' => 0,    'credit' => 500000, 'memo' => null],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('journal_entries', ['description' => 'Jurnal test seimbang', 'status' => 'draft']);
    });

    it('gagal jika lines kurang dari 2', function () {
        $this->actingAs($this->admin)
            ->post(route('journals.store'), [
                'date'  => now()->toDateString(),
                'lines' => [
                    ['account_id' => $this->kasId, 'debit' => 100000, 'credit' => 0, 'memo' => null],
                ],
            ])
            ->assertSessionHasErrors('lines');
    });

    it('gagal jika date kosong', function () {
        $this->actingAs($this->admin)
            ->post(route('journals.store'), [
                'date'  => '',
                'lines' => [
                    ['account_id' => $this->kasId,    'debit' => 100, 'credit' => 0,   'memo' => null],
                    ['account_id' => $this->piutangId, 'debit' => 0,  'credit' => 100, 'memo' => null],
                ],
            ])
            ->assertSessionHasErrors('date');
    });

    it('user tanpa permission mendapat 403', function () {
        $this->actingAs($this->viewOnly)
            ->post(route('journals.store'), [
                'date'  => now()->toDateString(),
                'lines' => [
                    ['account_id' => $this->kasId,    'debit' => 100, 'credit' => 0,   'memo' => null],
                    ['account_id' => $this->piutangId, 'debit' => 0,  'credit' => 100, 'memo' => null],
                ],
            ])
            ->assertForbidden();
    });
});

// ── show ───────────────────────────────────────────────────────────────────────
describe('Jurnal – show', function () {

    it('admin dapat melihat detail jurnal', function () {
        $id = insertDraftJournal();
        insertBalancedLines($id, $this->kasId, $this->piutangId, 100000);

        $this->actingAs($this->admin)
            ->get(route('journals.show', $id))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('Accounting/Journals/Show'));
    });

    it('mengembalikan 404 jika jurnal tidak ada', function () {
        $this->actingAs($this->admin)
            ->get(route('journals.show', 99999))
            ->assertNotFound();
    });
});

// ── post (pembukuan) ───────────────────────────────────────────────────────────
describe('Jurnal – post', function () {

    it('admin berhasil memposting jurnal draft yang seimbang', function () {
        $id = insertDraftJournal();
        insertBalancedLines($id, $this->kasId, $this->piutangId, 200000);

        $this->actingAs($this->admin)
            ->post(route('journals.post', $id))
            ->assertRedirect();

        $this->assertDatabaseHas('journal_entries', ['id' => $id, 'status' => 'posted']);
    });

    it('gagal posting jurnal yang sudah posted', function () {
        $id = insertDraftJournal(['status' => 'posted', 'posted_at' => now()]);
        insertBalancedLines($id, $this->kasId, $this->piutangId, 200000);

        $this->actingAs($this->admin)
            ->post(route('journals.post', $id))
            ->assertRedirect()
            ->assertSessionHas('error');
    });

    it('gagal posting jurnal tidak seimbang (debit != credit)', function () {
        $id = insertDraftJournal();
        DB::table('journal_lines')->insert([
            ['journal_entry_id' => $id, 'account_id' => $this->kasId,    'debit' => 300000, 'credit' => 0,      'created_at' => now(), 'updated_at' => now()],
            ['journal_entry_id' => $id, 'account_id' => $this->piutangId, 'debit' => 0,      'credit' => 200000, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $this->actingAs($this->admin)
            ->post(route('journals.post', $id))
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('journal_entries', ['id' => $id, 'status' => 'draft']);
    });

    it('user tanpa permission mendapat 403', function () {
        $id = insertDraftJournal();
        insertBalancedLines($id, $this->kasId, $this->piutangId, 100000);

        $this->actingAs($this->viewOnly)
            ->post(route('journals.post', $id))
            ->assertForbidden();
    });
});

// ── reverse (auto-reversal) ────────────────────────────────────────────────────
describe('Jurnal – reverse', function () {

    it('admin berhasil melakukan auto-reversal jurnal posted', function () {
        $id = insertDraftJournal(['status' => 'posted', 'posted_at' => now()]);
        insertBalancedLines($id, $this->kasId, $this->piutangId, 150000);

        $this->actingAs($this->admin)
            ->post(route('journals.reverse', $id))
            ->assertRedirect();

        $this->assertDatabaseHas('journal_entries', [
            'reversal_of_id' => $id,
            'status'         => 'posted',
        ]);
    });

    it('reversal menukar sisi debit dan kredit dengan benar', function () {
        $id = insertDraftJournal(['status' => 'posted', 'posted_at' => now()]);
        insertBalancedLines($id, $this->kasId, $this->piutangId, 75000);

        $this->actingAs($this->admin)
            ->post(route('journals.reverse', $id));

        $reversalId = DB::table('journal_entries')->where('reversal_of_id', $id)->value('id');

        $kasLine = DB::table('journal_lines')
            ->where('journal_entry_id', $reversalId)
            ->where('account_id', $this->kasId)
            ->first();

        // Kas semula debit 75000, setelah reversal harus jadi credit
        expect((float) $kasLine->debit)->toBe(0.0);
        expect((float) $kasLine->credit)->toBe(75000.0);
    });

    it('gagal reversal jurnal yang masih draft', function () {
        $id = insertDraftJournal(['status' => 'draft']);
        insertBalancedLines($id, $this->kasId, $this->piutangId, 150000);

        $this->actingAs($this->admin)
            ->post(route('journals.reverse', $id))
            ->assertRedirect()
            ->assertSessionHas('error');
    });
});
