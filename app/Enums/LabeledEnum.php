<?php

namespace App\Enums;

/**
 * Enum yang punya label bahasa Indonesia untuk tampilan UI dan diekspor ke TypeScript.
 */
interface LabeledEnum
{
    public function label(): string;
}
