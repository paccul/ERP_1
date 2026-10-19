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
});

function insertAccount(array $override = []): int
{
    return DB::table('accounts')->insertGetId(array_merge([
        'code'           => 'T-' . rand(1000, 9999),
        'name'           => 'Akun Test',
        'category'       => 'asset',
        'normal_balance' => 'debit',
        'is_system'      => false,
        'is_active'      => true,
        'created_at'     => now(),
        'updated_at'     => now(),
    ], $override));
}

// ── index ──────────────────────────────────────────────────────────────────────
describe('Akun – index', function () {

    it('admin dapat melihat daftar akun', function () {
        $this->actingAs($this->admin)
            ->get(route('accounts.index'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('Accounting/Accounts/Index'));
    });

    it('tamu diarahkan ke login', function () {
        $this->get(route('accounts.index'))->assertRedirect('/login');
    });

    it('user tanpa permission accounting.view mendapat 403', function () {
        $this->actingAs($this->viewOnly)
            ->get(route('accounts.index'))
            ->assertForbidden();
    });
});

// ── create & store ─────────────────────────────────────────────────────────────
describe('Akun – store', function () {

    it('admin berhasil menyimpan akun baru', function () {
        $this->actingAs($this->admin)
            ->post(route('accounts.store'), [
                'code'           => '9001',
                'name'           => 'Akun Baru Test',
                'category'       => 'asset',
                'normal_balance' => 'debit',
                'is_active'      => true,
            ])
            ->assertRedirect(route('accounts.index'));

        $this->assertDatabaseHas('accounts', ['code' => '9001']);
    });

    it('gagal jika code kosong', function () {
        $this->actingAs($this->admin)
            ->post(route('accounts.store'), [
                'code'           => '',
                'name'           => 'Test',
                'category'       => 'asset',
                'normal_balance' => 'debit',
            ])
            ->assertSessionHasErrors('code');
    });

    it('gagal jika code duplikat', function () {
        insertAccount(['code' => '9002']);

        $this->actingAs($this->admin)
            ->post(route('accounts.store'), [
                'code'           => '9002',
                'name'           => 'Duplikat',
                'category'       => 'asset',
                'normal_balance' => 'debit',
            ])
            ->assertSessionHasErrors('code');
    });

    it('gagal jika category tidak valid', function () {
        $this->actingAs($this->admin)
            ->post(route('accounts.store'), [
                'code'           => '9003',
                'name'           => 'Salah',
                'category'       => 'invalid_category',
                'normal_balance' => 'debit',
            ])
            ->assertSessionHasErrors('category');
    });

    it('user tanpa permission mendapat 403', function () {
        $this->actingAs($this->viewOnly)
            ->post(route('accounts.store'), [
                'code'           => '9004',
                'name'           => 'Test',
                'category'       => 'asset',
                'normal_balance' => 'debit',
            ])
            ->assertForbidden();
    });
});

// ── update ─────────────────────────────────────────────────────────────────────
describe('Akun – update', function () {

    it('admin berhasil memperbarui akun', function () {
        $id = insertAccount(['code' => '9010']);

        $this->actingAs($this->admin)
            ->put(route('accounts.update', $id), [
                'code'           => '9010',
                'name'           => 'Nama Diperbarui',
                'category'       => 'expense',
                'normal_balance' => 'debit',
                'is_active'      => true,
            ])
            ->assertRedirect(route('accounts.index'));

        $this->assertDatabaseHas('accounts', ['id' => $id, 'category' => 'expense']);
    });

    it('update mengembalikan 404 jika akun tidak ada', function () {
        $this->actingAs($this->admin)
            ->put(route('accounts.update', 99999), [
                'code'           => '9099',
                'name'           => 'Ghost',
                'category'       => 'asset',
                'normal_balance' => 'debit',
            ])
            ->assertNotFound();
    });
});

// ── destroy ────────────────────────────────────────────────────────────────────
describe('Akun – destroy', function () {

    it('admin berhasil menghapus akun tanpa mutasi', function () {
        $id = insertAccount(['code' => '9020']);

        $this->actingAs($this->admin)
            ->delete(route('accounts.destroy', $id))
            ->assertRedirect(route('accounts.index'));

        $this->assertDatabaseMissing('accounts', ['id' => $id]);
    });

    it('tidak bisa menghapus akun sistem', function () {
        $id = insertAccount(['code' => '9030', 'is_system' => true]);

        $this->actingAs($this->admin)
            ->delete(route('accounts.destroy', $id))
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('accounts', ['id' => $id]);
    });

    it('tidak bisa menghapus akun yang sudah punya mutasi jurnal', function () {
        $accountId = insertAccount(['code' => '9040']);

        $journalId = DB::table('journal_entries')->insertGetId([
            'number'      => 'JU-TEST-0001',
            'date'        => now()->toDateString(),
            'source_type' => 'manual',
            'status'      => 'draft',
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
        DB::table('journal_lines')->insert([
            'journal_entry_id' => $journalId,
            'account_id'       => $accountId,
            'debit'            => 100000,
            'credit'           => 0,
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        $this->actingAs($this->admin)
            ->delete(route('accounts.destroy', $accountId))
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('accounts', ['id' => $accountId]);
    });

    it('tidak bisa menghapus akun yang memiliki sub-akun', function () {
        $parentId = insertAccount(['code' => '9050']);
        insertAccount(['code' => '9051', 'parent_id' => $parentId]);

        $this->actingAs($this->admin)
            ->delete(route('accounts.destroy', $parentId))
            ->assertRedirect()
            ->assertSessionHas('error');
    });

    it('user tanpa permission mendapat 403 saat destroy', function () {
        $id = insertAccount(['code' => '9060']);

        $this->actingAs($this->viewOnly)
            ->delete(route('accounts.destroy', $id))
            ->assertForbidden();
    });
});
