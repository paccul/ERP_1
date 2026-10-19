import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.substring(0, eqIdx).trim();
          const val = trimmed.substring(eqIdx + 1).trim().replace(/^['"]|['"]$/g, "");
          if (!process.env[key]) process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedSettings() {
  console.log("=== Seeding Institution Settings & Org Units ===");

  // 1. Check institution_settings
  const { data: existingInst } = await supabase.from("institution_settings").select("id").limit(1);
  if (!existingInst || existingInst.length === 0) {
    const { error: instErr } = await supabase.from("institution_settings").insert({
      company_name: "PT Garda Utama Security Indonesia",
      license_number: "SIO/542/BIN/X/2023/Mabes-Polri",
      npwp: "01.234.567.8-012.000",
      address: "Gedung Cyber 2 Tower Lt. 15, Jl. H.R. Rasuna Said Blok X-5 No. 13, Jakarta Selatan 12950",
      phone: "021-52994400",
      email: "info@garda.bujp.id",
      ppn_rate: 11,
      pph23_rate: 2,
      bpjs_ketenagakerjaan_rate: 4.24,
      bpjs_kesehatan_rate: 1.0,
      logo_url: null,
    });
    if (instErr) console.error("Error inserting institution_settings:", instErr);
    else console.log("✓ Seeded institution_settings successfully.");
  } else {
    console.log("✓ institution_settings already exists.");
  }

  // 2. Check org_units
  const { data: existingOrg } = await supabase.from("org_units").select("id").limit(1);
  if (!existingOrg || existingOrg.length === 0) {
    // Level 1: Direktur Utama
    const { data: dirUtama, error: err1 } = await supabase
      .from("org_units")
      .insert({
        name: "Direktorat Utama (Direksi)",
        code: "DIR-UTAMA",
        level: 1,
        leader_name: "Irjen Pol. (Purn) Bambang Suryono, S.H., M.M.",
        parent_id: null,
      })
      .select("id")
      .single();

    if (err1) {
      console.error("Error inserting dirUtama:", err1);
      return;
    }

    // Level 2: Direktur Operasional
    const { data: dirOps } = await supabase
      .from("org_units")
      .insert({
        name: "Direktorat Operasional & Pengamanan",
        code: "DIR-OPS",
        level: 2,
        leader_name: "Kolonel (Purn) Hendra Wijaya",
        parent_id: dirUtama.id,
      })
      .select("id")
      .single();

    // Level 2: Direktur Keuangan & SDM
    const { data: dirFin } = await supabase
      .from("org_units")
      .insert({
        name: "Direktorat Keuangan & Sumber Daya Manusia",
        code: "DIR-FIN",
        level: 2,
        leader_name: "Siti Rahmawati, S.E., Ak., CA",
        parent_id: dirUtama.id,
      })
      .select("id")
      .single();

    if (dirOps) {
      // Level 3: Manajer Operasional Wilayah
      const { data: mgrOps } = await supabase
        .from("org_units")
        .insert({
          name: "Divisi Operasional & Penempatan Jaga",
          code: "DIV-OPS-REG",
          level: 3,
          leader_name: "Kapten (Purn) Agus Prasetyo",
          parent_id: dirOps.id,
        })
        .select("id")
        .single();

      if (mgrOps) {
        // Level 4: Chief Security Area
        const { data: chfSecurity } = await supabase
          .from("org_units")
          .insert({
            name: "Chief Security Kawasan Jabodetabek",
            code: "CHF-JABO",
            level: 4,
            leader_name: "Supriyanto, S.Sos (Gada Utama)",
            parent_id: mgrOps.id,
          })
          .select("id")
          .single();

        if (chfSecurity) {
          // Level 5: Danru Pos Jaga
          await supabase.from("org_units").insert({
            name: "Komandan Regu (Danru) Pos Penjagaan",
            code: "DANRU-POS",
            level: 5,
            leader_name: "Budi Santoso (Gada Madya)",
            parent_id: chfSecurity.id,
          });
        }
      }
    }

    if (dirFin) {
      // Level 3: Manajer HRD & Logistik
      await supabase.from("org_units").insert({
        name: "Divisi HRD & Rekrutmen (PSB)",
        code: "DIV-HRD",
        level: 3,
        leader_name: "Dra. Nurul Hidayati, M.Psi",
        parent_id: dirFin.id,
      });

      await supabase.from("org_units").insert({
        name: "Divisi Keuangan, Payroll & Logistik",
        code: "DIV-FINLOG",
        level: 3,
        leader_name: "Ahmad Zaelani, S.Kom",
        parent_id: dirFin.id,
      });
    }

    console.log("✓ Seeded org_units hierarchy successfully.");
  } else {
    console.log("✓ org_units already exists.");
  }
}

seedSettings();
