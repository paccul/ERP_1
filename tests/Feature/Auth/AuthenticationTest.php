<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

beforeEach(fn () => $this->seed(\Database\Seeders\RolePermissionSeeder::class));

describe('Authentication', function () {

    it('mengarahkan tamu dari root ke halaman login', function () {
        $this->get('/')->assertRedirect('/login');
    });

    it('mengarahkan tamu dari dashboard ke halaman login', function () {
        $this->get('/dashboard')->assertRedirect('/login');
    });

    it('menampilkan halaman login', function () {
        $this->get('/login')->assertOk();
    });

    it('berhasil login dengan kredensial valid lalu diarahkan ke dashboard', function () {
        User::factory()->create([
            'email' => 'user@test.com',
            'password' => Hash::make('Rahasia123!'),
        ]);

        $this->post('/login', [
            'email' => 'user@test.com',
            'password' => 'Rahasia123!',
        ])->assertRedirect('/dashboard');

        $this->assertAuthenticated();
    });

    it('gagal login dengan password salah dan mengembalikan error pada field email', function () {
        User::factory()->create([
            'email' => 'user@test.com',
            'password' => Hash::make('Rahasia123!'),
        ]);

        $this->post('/login', [
            'email' => 'user@test.com',
            'password' => 'passwordsalah',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    });

    it('gagal login dengan email yang tidak terdaftar', function () {
        $this->post('/login', [
            'email' => 'tidakada@example.com',
            'password' => 'Rahasia123!',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    });

    it('menolak login tanpa mengisi email dan password', function () {
        $this->post('/login', [])->assertSessionHasErrors(['email', 'password']);
    });

    it('berhasil logout dan menghancurkan sesi', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/logout')
            ->assertRedirect('/login');

        $this->assertGuest();
    });

    it('user yang sudah login tidak bisa mengakses halaman login kembali', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/login')
            ->assertRedirect();
    });
});
