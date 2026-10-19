<?php

namespace App\Enums;

enum ApplicantStatus: string implements LabeledEnum
{
    case New = 'new';
    case Screening = 'screening';
    case Accepted = 'accepted';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::New => 'Baru',
            self::Screening => 'Seleksi',
            self::Accepted => 'Diterima',
            self::Rejected => 'Ditolak',
        };
    }

    /**
     * Transisi yang diizinkan: baru → seleksi → diterima/ditolak. Status akhir tidak bisa diubah.
     *
     * @return list<self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::New => [self::Screening, self::Rejected],
            self::Screening => [self::Accepted, self::Rejected],
            self::Accepted, self::Rejected => [],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }
}
