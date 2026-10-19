<?php

namespace App\Support\Database;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Constraint yang tidak tersedia lewat Blueprint (CHECK, tabel append-only, saldo jurnal).
 *
 * PostgreSQL memakai constraint dan trigger asli. SQLite (dipakai test lokal) tidak mendukung
 * ALTER TABLE ... ADD CONSTRAINT, jadi aturan yang sama dipasang sebagai trigger BEFORE INSERT/UPDATE
 * agar pelanggaran tetap ditolak di level database pada kedua driver.
 */
final class SchemaConstraints
{
    /**
     * @param  list<string>  $columns  Kolom yang dipakai di $expression (untuk membuat referensi NEW.kolom di SQLite).
     */
    public static function check(string $table, string $name, string $expression, array $columns): void
    {
        if (self::isPostgres()) {
            DB::statement(sprintf(
                'ALTER TABLE "%s" ADD CONSTRAINT "%s" CHECK (%s)',
                $table,
                $name,
                $expression,
            ));

            return;
        }

        $newRowExpression = $expression;
        foreach ($columns as $column) {
            $newRowExpression = (string) preg_replace('/\b'.preg_quote($column, '/').'\b/', 'NEW.'.$column, $newRowExpression);
        }

        $message = str_replace("'", "''", "CHECK constraint {$name} gagal pada tabel {$table}");

        foreach (['INSERT', 'UPDATE'] as $event) {
            DB::statement(sprintf(
                'CREATE TRIGGER "%s_%s" BEFORE %s ON "%s" FOR EACH ROW WHEN NOT (%s) BEGIN SELECT RAISE(ABORT, \'%s\'); END',
                $name,
                strtolower($event),
                $event,
                $table,
                $newRowExpression,
                $message,
            ));
        }
    }

    /** Tolak UPDATE dan DELETE pada tabel (kartu stok bersifat append-only). */
    public static function appendOnly(string $table): void
    {
        if (self::isPostgres()) {
            $function = "{$table}_append_only";

            DB::unprepared(<<<SQL
                CREATE OR REPLACE FUNCTION {$function}() RETURNS trigger AS \$\$
                BEGIN
                    RAISE EXCEPTION 'Tabel {$table} bersifat append-only dan tidak boleh diubah atau dihapus.';
                END;
                \$\$ LANGUAGE plpgsql
                SQL);

            DB::unprepared("CREATE TRIGGER {$function}_guard BEFORE UPDATE OR DELETE ON \"{$table}\" FOR EACH ROW EXECUTE FUNCTION {$function}()");

            return;
        }

        foreach (['UPDATE', 'DELETE'] as $event) {
            DB::statement(sprintf(
                'CREATE TRIGGER "%s_append_only_%s" BEFORE %s ON "%s" FOR EACH ROW BEGIN SELECT RAISE(ABORT, \'Tabel %s bersifat append-only.\'); END',
                $table,
                strtolower($event),
                $event,
                $table,
                $table,
            ));
        }
    }

    /**
     * Jurnal terposting wajib seimbang saat transaksi di-commit (PostgreSQL saja).
     * Trigger konstrain ditunda sampai akhir transaksi supaya baris debit dan kredit bisa
     * disisipkan satu per satu. Di SQLite keseimbangan dijaga JournalPostingService.
     */
    public static function balancedPostedJournals(): void
    {
        if (! self::isPostgres()) {
            return;
        }

        DB::unprepared(<<<'SQL'
            CREATE OR REPLACE FUNCTION journal_entry_must_balance() RETURNS trigger AS $$
            DECLARE
                target_entry_id bigint;
                total_debit numeric;
                total_credit numeric;
                entry_status text;
            BEGIN
                IF TG_OP = 'DELETE' THEN
                    target_entry_id := OLD.journal_entry_id;
                ELSE
                    target_entry_id := NEW.journal_entry_id;
                END IF;

                SELECT status INTO entry_status FROM journal_entries WHERE id = target_entry_id;

                IF entry_status = 'posted' THEN
                    SELECT COALESCE(SUM(debit), 0), COALESCE(SUM(credit), 0)
                      INTO total_debit, total_credit
                      FROM journal_lines
                     WHERE journal_entry_id = target_entry_id;

                    IF total_debit <> total_credit THEN
                        RAISE EXCEPTION 'Jurnal % tidak seimbang: debit % <> kredit %', target_entry_id, total_debit, total_credit;
                    END IF;
                END IF;

                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql
            SQL);

        DB::unprepared(<<<'SQL'
            CREATE CONSTRAINT TRIGGER journal_lines_must_balance
            AFTER INSERT OR UPDATE OR DELETE ON journal_lines
            DEFERRABLE INITIALLY DEFERRED
            FOR EACH ROW EXECUTE FUNCTION journal_entry_must_balance()
            SQL);
    }

    public static function dropBalancedPostedJournals(): void
    {
        if (! self::isPostgres()) {
            return;
        }

        DB::unprepared('DROP TRIGGER IF EXISTS journal_lines_must_balance ON journal_lines');
        DB::unprepared('DROP FUNCTION IF EXISTS journal_entry_must_balance()');
    }

    public static function dropAppendOnly(string $table): void
    {
        if (self::isPostgres()) {
            DB::unprepared("DROP TRIGGER IF EXISTS {$table}_append_only_guard ON \"{$table}\"");
            DB::unprepared("DROP FUNCTION IF EXISTS {$table}_append_only()");
        }

        Schema::dropIfExists($table);
    }

    private static function isPostgres(): bool
    {
        return DB::getDriverName() === 'pgsql';
    }
}
