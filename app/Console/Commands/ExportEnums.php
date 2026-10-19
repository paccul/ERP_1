<?php

namespace App\Console\Commands;

use App\Enums\LabeledEnum;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use ReflectionEnum;

class ExportEnums extends Command
{
    protected $signature = 'garda:export-enums {--path=resources/js/types/enums.ts : Lokasi berkas keluaran relatif terhadap root proyek}';

    protected $description = 'Ekspor PHP backed enum di app/Enums ke berkas TypeScript agar nilai dan label tidak diduplikasi manual.';

    public function handle(): int
    {
        $enumClasses = $this->discoverEnumClasses();
        $outputPath = base_path((string) $this->option('path'));

        File::ensureDirectoryExists(dirname($outputPath));
        File::put($outputPath, $this->renderTypeScript($enumClasses));

        $this->info(count($enumClasses).' enum diekspor ke '.$this->option('path').'.');

        return self::SUCCESS;
    }

    /**
     * @return list<class-string<\BackedEnum>>
     */
    private function discoverEnumClasses(): array
    {
        $classes = [];

        foreach (File::files(app_path('Enums')) as $file) {
            $className = 'App\\Enums\\'.$file->getFilenameWithoutExtension();

            if (! enum_exists($className)) {
                continue;
            }

            if (! (new ReflectionEnum($className))->isBacked()) {
                continue;
            }

            /** @var class-string<\BackedEnum> $className */
            $classes[] = $className;
        }

        sort($classes);

        return $classes;
    }

    /**
     * @param  list<class-string<\BackedEnum>>  $enumClasses
     */
    private function renderTypeScript(array $enumClasses): string
    {
        $blocks = [
            "// Dihasilkan oleh `php artisan garda:export-enums`. Jangan diedit manual.\n",
        ];

        foreach ($enumClasses as $enumClass) {
            $blocks[] = $this->renderEnum($enumClass);
        }

        return implode("\n", $blocks);
    }

    /**
     * @param  class-string<\BackedEnum>  $enumClass
     */
    private function renderEnum(string $enumClass): string
    {
        $name = class_basename($enumClass);
        $cases = $enumClass::cases();
        $hasLabels = is_subclass_of($enumClass, LabeledEnum::class);

        $valueLines = [];
        $labelLines = [];

        foreach ($cases as $case) {
            $valueLines[] = sprintf("    %s: '%s',", $case->name, $case->value);

            if ($hasLabels && $case instanceof LabeledEnum) {
                $labelLines[] = sprintf("    '%s': '%s',", $case->value, Str::replace("'", "\\'", $case->label()));
            }
        }

        $output = "export const {$name} = {\n".implode("\n", $valueLines)."\n} as const;\n";
        $output .= "export type {$name} = (typeof {$name})[keyof typeof {$name}];\n";

        if ($hasLabels) {
            $output .= "export const {$name}Label: Record<{$name}, string> = {\n".implode("\n", $labelLines)."\n};\n";
        }

        return $output;
    }
}
