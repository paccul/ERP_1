<?php

use App\Enums\ApplicantStatus;
use App\Enums\InvoiceStatus;
use App\Enums\LabeledEnum;
use App\Enums\PersonnelStatus;
use Illuminate\Support\Facades\File;

it('memberi label bahasa Indonesia untuk setiap case enum berlabel', function () {
    foreach (File::files(app_path('Enums')) as $file) {
        $class = 'App\\Enums\\'.$file->getFilenameWithoutExtension();

        if (! enum_exists($class) || ! is_subclass_of($class, LabeledEnum::class)) {
            continue;
        }

        foreach ($class::cases() as $case) {
            expect($case->label())->not->toBeEmpty();
        }
    }
});

it('menerapkan transisi status pelamar yang valid saja', function () {
    expect(ApplicantStatus::New->canTransitionTo(ApplicantStatus::Screening))->toBeTrue()
        ->and(ApplicantStatus::New->canTransitionTo(ApplicantStatus::Accepted))->toBeFalse()
        ->and(ApplicantStatus::Accepted->canTransitionTo(ApplicantStatus::Rejected))->toBeFalse();
});

it('menerapkan siklus hidup invoice', function () {
    expect(InvoiceStatus::Draft->canTransitionTo(InvoiceStatus::Issued))->toBeTrue()
        ->and(InvoiceStatus::Issued->canTransitionTo(InvoiceStatus::Paid))->toBeTrue()
        ->and(InvoiceStatus::Void->canTransitionTo(InvoiceStatus::Issued))->toBeFalse();
});

it('mengekspor enum ke TypeScript lewat garda:export-enums', function () {
    $target = 'storage/framework/testing/enums.ts';

    $this->artisan('garda:export-enums', ['--path' => $target])->assertSuccessful();

    $content = File::get(base_path($target));

    expect($content)->toContain('export const PersonnelStatus')
        ->toContain("Active: '".PersonnelStatus::Active->value."'")
        ->toContain('export const InvoiceStatusLabel')
        ->toContain("'issued': 'Terbit'");

    File::delete(base_path($target));
});
