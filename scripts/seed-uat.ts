import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// 1. Load environment variables from .env.local
function loadEnv() {
  const envPaths = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), "..", "ERP_2", ".env.local"),
    path.resolve("D:/Data/Project/ERP_2/.env.local"),
    path.resolve("d:/Data/Project/erp-2/.env.local"),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx > 0) {
            const key = trimmed.substring(0, eqIdx).trim();
            const val = trimmed.substring(eqIdx + 1).trim().replace(/^['"]|['"]$/g, "");
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      }
      break;
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("=== TAHAP 1: SEEDING DATA UAT & AKUN MULTI-ROLE ===");

  // 1. Roles & Permissions
  console.log("\n[1/6] Seeding Roles...");
  const rolesData = [
    { name: "super_admin", description: "Super Administrator BUJP (Full Access)", is_system: true },
    { name: "hrd_admin", description: "HR & Operasional Personel Satpam", is_system: true },
    { name: "finance_admin", description: "Finance, Invoicing & Payroll Officer", is_system: true },
  ];

  const roleMap: Record<string, string> = {};
  for (const r of rolesData) {
    const { data: existing } = await supabase.from("roles").select("id, name").eq("name", r.name).maybeSingle();
    if (existing) {
      roleMap[r.name] = existing.id;
      console.log(`  - Role exists: ${r.name} (${existing.id})`);
    } else {
      const { data: created, error } = await supabase.from("roles").insert(r).select("id, name").single();
      if (error) throw new Error(`Failed to create role ${r.name}: ${error.message}`);
      roleMap[r.name] = created.id;
      console.log(`  + Created role: ${r.name} (${created.id})`);
    }
  }

  // 1b. Seed Role Permissions for UAT roles
  console.log("  Seeding permissions for UAT roles...");
  const allModules = ["security", "recruitment", "logistics", "finance", "accounting", "reports", "users", "institution"];

  const setPerm = async (roleId: string, module: string, canView: boolean, canManage: boolean) => {
    const { data: existing } = await supabase
      .from("role_permissions")
      .select("id")
      .eq("role_id", roleId)
      .eq("module", module)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("role_permissions")
        .update({ can_view: canView, can_manage: canManage })
        .eq("id", existing.id);
    } else {
      await supabase.from("role_permissions").insert({
        role_id: roleId,
        module,
        can_view: canView,
        can_manage: canManage,
      });
    }
  };

  if (roleMap["super_admin"]) {
    for (const mod of allModules) {
      await setPerm(roleMap["super_admin"], mod, true, true);
    }
    console.log("  + super_admin granted all modules full access.");
  }

  if (roleMap["hrd_admin"]) {
    for (const mod of ["security", "recruitment", "reports"]) {
      await setPerm(roleMap["hrd_admin"], mod, true, true);
    }
    await setPerm(roleMap["hrd_admin"], "logistics", true, false);
    console.log("  + hrd_admin granted HR & Security access.");
  }

  if (roleMap["finance_admin"]) {
    for (const mod of ["finance", "accounting", "reports"]) {
      await setPerm(roleMap["finance_admin"], mod, true, true);
    }
    console.log("  + finance_admin granted Finance & Accounting access.");
  }

  // 2. UAT Auth Users
  console.log("\n[2/6] Seeding UAT Multi-Role Users...");
  const uatUsers = [
    {
      email: "admin@garda.bujp.id",
      role: "super_admin",
      fullName: "Super Admin Garda",
      password: "Password123!",
    },
    {
      email: "hrd@garda.bujp.id",
      role: "hrd_admin",
      fullName: "HRD Manager Garda",
      password: "Password123!",
    },
    {
      email: "finance@garda.bujp.id",
      role: "finance_admin",
      fullName: "Finance Manager Garda",
      password: "Password123!",
    },
  ];

  // List existing auth users
  const { data: userList, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw new Error(`Failed to list auth users: ${listErr.message}`);

  for (const u of uatUsers) {
    const existing = userList.users.find((x) => x.email?.toLowerCase() === u.email.toLowerCase());
    let userId = "";

    if (existing) {
      userId = existing.id;
      // Update password & metadata to ensure credentials are valid
      const { error: updErr } = await supabase.auth.admin.updateUserById(userId, {
        password: u.password,
        email_confirm: true,
        user_metadata: { role: u.role, full_name: u.fullName },
      });
      if (updErr) console.warn(`  ! Warn updating user ${u.email}:`, updErr.message);
      console.log(`  - Updated existing auth user: ${u.email} (${userId})`);
    } else {
      const { data: created, error: crtErr } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { role: u.role, full_name: u.fullName },
      });
      if (crtErr) throw new Error(`Failed to create user ${u.email}: ${crtErr.message}`);
      userId = created.user.id;
      console.log(`  + Created auth user: ${u.email} (${userId})`);
    }

    // Ensure Profile exists and is linked
    const roleId = roleMap[u.role] || null;
    const { error: profErr } = await supabase.from("profiles").upsert(
      {
        id: userId,
        email: u.email,
        full_name: u.fullName,
        role_id: roleId,
        is_active: true,
      },
      { onConflict: "id" }
    );
    if (profErr) console.warn(`  ! Warn upserting profile for ${u.email}:`, profErr.message);
    else console.log(`  + Linked profile for: ${u.email}`);
  }

  // 3. Clients & Sites
  console.log("\n[3/6] Seeding Clients & Sites...");
  const clientsData = [
    {
      code: "CLN-BCA",
      company_name: "PT Bank Central Asia Tbk",
      pic_name: "Bambang Hartono",
      pic_phone: "081299887766",
      pic_email: "security@bca.co.id",
      billing_address: "Menara BCA Lt. 32, Jl. M.H. Thamrin No. 1, Jakarta Pusat",
      npwp: "01.000.111.2-031.000",
      contract_end_date: "2027-12-31",
      status: "active",
    },
    {
      code: "CLN-ASTRA",
      company_name: "PT Astra International Tbk",
      pic_name: "Gunawan Soetanto",
      pic_phone: "081122334455",
      pic_email: "facilities@astra.co.id",
      billing_address: "Menara Astra, Jl. Jend. Sudirman Kav. 5-6, Jakarta Pusat",
      npwp: "01.000.222.3-042.000",
      contract_end_date: "2026-11-30",
      status: "active",
    },
    {
      code: "CLN-TELKOM",
      company_name: "PT Telkom Indonesia Tbk",
      pic_name: "Dodi Setiawan",
      pic_phone: "081377665544",
      pic_email: "security.dept@telkom.co.id",
      billing_address: "Telkom Landmark Tower, Jl. Gatot Subroto Kav. 52, Jakarta Selatan",
      npwp: "01.000.333.4-053.000",
      contract_end_date: "2028-06-30",
      status: "active",
    },
  ];

  const clientMap: Record<string, string> = {};
  for (const c of clientsData) {
    const { data: existing } = await supabase.from("clients").select("id").eq("code", c.code).maybeSingle();
    if (existing) {
      clientMap[c.code] = existing.id;
      console.log(`  - Client exists: ${c.company_name} (${existing.id})`);
    } else {
      const { data: created, error } = await supabase.from("clients").insert(c).select("id").single();
      if (error) throw new Error(`Failed to insert client ${c.company_name}: ${error.message}`);
      clientMap[c.code] = created.id;
      console.log(`  + Created client: ${c.company_name} (${created.id})`);
    }
  }

  const sitesData = [
    {
      code: "SITE-BCA-01",
      name: "Menara BCA Grand Indonesia - Main Gate & Lobby",
      client_id: clientMap["CLN-BCA"],
      address: "Jl. M.H. Thamrin No. 1, Jakarta Pusat",
      required_personnel_per_shift: 4,
      monthly_rate_per_personnel: 5500000,
      latitude: -6.1953,
      longitude: 106.8219,
      status: "active",
    },
    {
      code: "SITE-ASTRA-01",
      name: "Menara Astra Sudirman - Perimeter & Basement",
      client_id: clientMap["CLN-ASTRA"],
      address: "Jl. Jend. Sudirman Kav. 5-6, Jakarta Pusat",
      required_personnel_per_shift: 3,
      monthly_rate_per_personnel: 5200000,
      latitude: -6.2088,
      longitude: 106.8227,
      status: "active",
    },
    {
      code: "SITE-TLKM-01",
      name: "Telkom Landmark Tower - Data Center Annex",
      client_id: clientMap["CLN-TELKOM"],
      address: "Jl. Gatot Subroto Kav. 52, Jakarta Selatan",
      required_personnel_per_shift: 3,
      monthly_rate_per_personnel: 5800000,
      latitude: -6.2301,
      longitude: 106.8172,
      status: "active",
    },
  ];

  const siteMap: Record<string, string> = {};
  for (const s of sitesData) {
    const { data: existing } = await supabase.from("sites").select("id").eq("code", s.code).maybeSingle();
    if (existing) {
      siteMap[s.code] = existing.id;
      console.log(`  - Site exists: ${s.name} (${existing.id})`);
    } else {
      const { data: created, error } = await supabase.from("sites").insert(s).select("id").single();
      if (error) throw new Error(`Failed to insert site ${s.name}: ${error.message}`);
      siteMap[s.code] = created.id;
      console.log(`  + Created site: ${s.name} (${created.id})`);
    }
  }

  // 4. Personnel Satpam (>= 15 Personnel with varied KTA dates)
  console.log("\n[4/6] Seeding Personnel Satpam (15 Records with varied KTA)...");
  const now = new Date();
  const formatOffsetDate = (days: number) => {
    const d = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return d.toISOString().split("T")[0];
  };

  const personnelData = [
    // 5 Aktif Sehat (KTA berlaku panjang > 1 tahun)
    {
      nik: "3171010101900001",
      full_name: "Sertu Joko Susilo",
      phone: "081234567001",
      email: "joko.susilo@guard.id",
      kta_number: "KTA-POL-2023-001",
      kta_expiry_date: formatOffsetDate(400),
      gada_level: "Utama",
      position: "Chief Security",
      status: "active",
      current_site_id: siteMap["SITE-BCA-01"],
      join_date: "2020-01-15",
    },
    {
      nik: "3171010101900002",
      full_name: "Agus Pratama",
      phone: "081234567002",
      email: "agus.pratama@guard.id",
      kta_number: "KTA-POL-2023-002",
      kta_expiry_date: formatOffsetDate(350),
      gada_level: "Madya",
      position: "Danru",
      status: "active",
      current_site_id: siteMap["SITE-BCA-01"],
      join_date: "2021-03-10",
    },
    {
      nik: "3171010101900003",
      full_name: "Budi Santoso",
      phone: "081234567003",
      email: "budi.santoso@guard.id",
      kta_number: "KTA-POL-2023-003",
      kta_expiry_date: formatOffsetDate(280),
      gada_level: "Pratama",
      position: "Anggota",
      status: "active",
      current_site_id: siteMap["SITE-BCA-01"],
      join_date: "2022-05-01",
    },
    {
      nik: "3171010101900004",
      full_name: "Hendro Wibowo",
      phone: "081234567004",
      email: "hendro.w@guard.id",
      kta_number: "KTA-POL-2023-004",
      kta_expiry_date: formatOffsetDate(200),
      gada_level: "Pratama",
      position: "Anggota",
      status: "active",
      current_site_id: siteMap["SITE-BCA-01"],
      join_date: "2022-06-15",
    },
    {
      nik: "3171010101900005",
      full_name: "Rian Hidayat",
      phone: "081234567005",
      email: "rian.h@guard.id",
      kta_number: "KTA-POL-2023-005",
      kta_expiry_date: formatOffsetDate(180),
      gada_level: "Pratama",
      position: "Anggota",
      status: "active",
      current_site_id: siteMap["SITE-ASTRA-01"],
      join_date: "2023-01-10",
    },

    // 4 KTA Segera Kedaluwarsa (<= 30 hari)
    {
      nik: "3171010101900006",
      full_name: "Dedi Suryadi",
      phone: "081234567006",
      email: "dedi.s@guard.id",
      kta_number: "KTA-POL-2021-006",
      kta_expiry_date: formatOffsetDate(14), // 14 hari lagi
      gada_level: "Pratama",
      position: "Anggota",
      status: "active",
      current_site_id: siteMap["SITE-ASTRA-01"],
      join_date: "2021-07-20",
    },
    {
      nik: "3171010101900007",
      full_name: "Eko Prasetyo",
      phone: "081234567007",
      email: "eko.p@guard.id",
      kta_number: "KTA-POL-2021-007",
      kta_expiry_date: formatOffsetDate(25), // 25 hari lagi
      gada_level: "Madya",
      position: "Danru",
      status: "active",
      current_site_id: siteMap["SITE-ASTRA-01"],
      join_date: "2020-11-05",
    },
    {
      nik: "3171010101900008",
      full_name: "Fajar Nugraha",
      phone: "081234567008",
      email: "fajar.n@guard.id",
      kta_number: "KTA-POL-2021-008",
      kta_expiry_date: formatOffsetDate(5), // 5 hari lagi!
      gada_level: "Pratama",
      position: "Anggota",
      status: "active",
      current_site_id: siteMap["SITE-TLKM-01"],
      join_date: "2022-02-14",
    },
    {
      nik: "3171010101900009",
      full_name: "Guruh Sukarno",
      phone: "081234567009",
      email: "guruh.s@guard.id",
      kta_number: "KTA-POL-2021-009",
      kta_expiry_date: formatOffsetDate(2), // 2 hari lagi!
      gada_level: "Pratama",
      position: "Anggota",
      status: "active",
      current_site_id: siteMap["SITE-TLKM-01"],
      join_date: "2021-09-01",
    },

    // 3 KTA Sudah Kedaluwarsa (Expired)
    {
      nik: "3171010101900010",
      full_name: "Hadi Purnomo",
      phone: "081234567010",
      email: "hadi.p@guard.id",
      kta_number: "KTA-POL-2020-010",
      kta_expiry_date: formatOffsetDate(-10), // Lewat 10 hari
      gada_level: "Pratama",
      position: "Anggota",
      status: "active",
      current_site_id: siteMap["SITE-TLKM-01"],
      join_date: "2020-05-15",
    },
    {
      nik: "3171010101900011",
      full_name: "Indra Gunawan",
      phone: "081234567011",
      email: "indra.g@guard.id",
      kta_number: "KTA-POL-2020-011",
      kta_expiry_date: formatOffsetDate(-45), // Lewat 45 hari
      gada_level: "Pratama",
      position: "Anggota",
      status: "active",
      current_site_id: siteMap["SITE-BCA-01"],
      join_date: "2019-10-01",
    },
    {
      nik: "3171010101900012",
      full_name: "Kuncoro Jati",
      phone: "081234567012",
      email: "kuncoro.j@guard.id",
      kta_number: "KTA-POL-2019-012",
      kta_expiry_date: formatOffsetDate(-90), // Lewat 90 hari
      gada_level: "Pratama",
      position: "Anggota",
      status: "active",
      current_site_id: siteMap["SITE-ASTRA-01"],
      join_date: "2019-04-12",
    },

    // 3 Personel Tambahan
    {
      nik: "3171010101900013",
      full_name: "Lukman Hakim",
      phone: "081234567013",
      email: "lukman.h@guard.id",
      kta_number: "KTA-POL-2023-013",
      kta_expiry_date: formatOffsetDate(300),
      gada_level: "Madya",
      position: "Danru",
      status: "active",
      current_site_id: siteMap["SITE-TLKM-01"],
      join_date: "2021-12-01",
    },
    {
      nik: "3171010101900014",
      full_name: "Muhammad Rizki",
      phone: "081234567014",
      email: "m.rizki@guard.id",
      kta_number: "KTA-POL-2023-014",
      kta_expiry_date: formatOffsetDate(250),
      gada_level: "Pratama",
      position: "Anggota",
      status: "active",
      current_site_id: siteMap["SITE-BCA-01"],
      join_date: "2023-03-20",
    },
    {
      nik: "3171010101900015",
      full_name: "Nico Firmansyah",
      phone: "081234567015",
      email: "nico.f@guard.id",
      kta_number: "KTA-POL-2023-015",
      kta_expiry_date: formatOffsetDate(210),
      gada_level: "Pratama",
      position: "Anggota",
      status: "active",
      current_site_id: siteMap["SITE-ASTRA-01"],
      join_date: "2023-05-11",
    },
  ];

  const personnelList: Array<{ id: string; nik: string; name: string }> = [];
  for (const p of personnelData) {
    const { data: existing } = await supabase.from("personnel").select("id").eq("nik", p.nik).maybeSingle();
    if (existing) {
      await supabase.from("personnel").update(p).eq("id", existing.id);
      personnelList.push({ id: existing.id, nik: p.nik, name: p.full_name });
      console.log(`  - Updated personnel: ${p.full_name} (${existing.id})`);
    } else {
      const { data: created, error } = await supabase.from("personnel").insert(p).select("id").single();
      if (error) console.error(`Failed to insert personnel ${p.full_name}:`, error.message);
      else {
        personnelList.push({ id: created.id, nik: p.nik, name: p.full_name });
        console.log(`  + Created personnel: ${p.full_name} (${created.id})`);
      }
    }
  }

  // 5. SKU Kaporlap Logistics Items (>= 5 Items)
  console.log("\n[5/6] Seeding Kaporlap Items (5 SKU)...");
  const itemsData = [
    {
      code: "KAP-PDH-01",
      name: "Seragam PDH Satpam Lengkap + Atribut",
      category: "Seragam",
      unit: "Stel",
      size: "L",
      initial_stock: 100,
      current_stock: 85,
      minimum_stock: 20,
      unit_price: 350000,
      notes: "Standar Perpol No 4 Tahun 2020",
    },
    {
      code: "KAP-PDL-01",
      name: "Sepatu PDL Satpam Kulit Standar",
      category: "Perlengkapan",
      unit: "Pasang",
      size: "42",
      initial_stock: 50,
      current_stock: 40,
      minimum_stock: 10,
      unit_price: 275000,
      notes: "Warna hitam sol tebal",
    },
    {
      code: "KAP-TGT-01",
      name: "Tongkat T Satpam (Baton) & Sarung",
      category: "Perlengkapan",
      unit: "Buah",
      size: "Standar",
      initial_stock: 40,
      current_stock: 35,
      minimum_stock: 10,
      unit_price: 85000,
      notes: "Bahan fiber polimer kuat",
    },
    {
      code: "KAP-HT-01",
      name: "Handy Talkie UHF Dual Band Motorola",
      category: "Komunikasi",
      unit: "Unit",
      size: "Standar",
      initial_stock: 25,
      current_stock: 20,
      minimum_stock: 5,
      unit_price: 850000,
      notes: "Include charger desktop & ear-piece",
    },
    {
      code: "KAP-ROM-01",
      name: "Rompi Safety Reflektor Hijau Stabilo",
      category: "Rompi",
      unit: "Buah",
      size: "All Size",
      initial_stock: 60,
      current_stock: 50,
      minimum_stock: 15,
      unit_price: 65000,
      notes: "Scotchlite reflektif patroli malam",
    },
  ];

  for (const item of itemsData) {
    const { data: existing } = await supabase.from("items").select("id").eq("code", item.code).maybeSingle();
    if (existing) {
      await supabase.from("items").update(item).eq("id", existing.id);
      console.log(`  - Updated item: ${item.name} (${existing.id})`);
    } else {
      const { data: created, error } = await supabase.from("items").insert(item).select("id").single();
      if (error) console.error(`Failed to insert item ${item.name}:`, error.message);
      else console.log(`  + Created item: ${item.name} (${created.id})`);
    }
  }

  // 6. Shifts & 7-Day Roster
  console.log("\n[6/6] Seeding Shifts & 7-Day Roster...");
  const shiftsData = [
    { name: "Pagi", start_time: "07:00:00", end_time: "15:00:00" },
    { name: "Siang", start_time: "15:00:00", end_time: "23:00:00" },
    { name: "Malam", start_time: "23:00:00", end_time: "07:00:00" },
  ];

  const shiftMap: Record<string, string> = {};
  for (const s of shiftsData) {
    const { data: existing } = await supabase.from("shifts").select("id").eq("name", s.name).maybeSingle();
    if (existing) {
      shiftMap[s.name] = existing.id;
      console.log(`  - Shift exists: ${s.name} (${existing.id})`);
    } else {
      const { data: created, error } = await supabase.from("shifts").insert(s).select("id").single();
      if (error) console.error(`Failed to insert shift ${s.name}:`, error.message);
      else {
        shiftMap[s.name] = created.id;
        console.log(`  + Created shift: ${s.name} (${created.id})`);
      }
    }
  }

  // Seed 7-day roster assignments for first 6 personnel on Site BCA
  const bcaSiteId = siteMap["SITE-BCA-01"];
  const shiftKeys = ["Pagi", "Siang", "Malam"];
  const rosterDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    rosterDates.push(formatOffsetDate(i));
  }

  if (personnelList.length >= 6 && bcaSiteId) {
    console.log(`  Seeding roster assignments for dates: ${rosterDates[0]} s/d ${rosterDates[6]}`);
    for (const d of rosterDates) {
      for (let pIdx = 0; pIdx < Math.min(personnelList.length, 6); pIdx++) {
        const pers = personnelList[pIdx];
        const assignedShift = shiftMap[shiftKeys[pIdx % 3]];

        const { data: existing } = await supabase
          .from("roster_assignments")
          .select("id")
          .eq("personnel_id", pers.id)
          .eq("date", d)
          .maybeSingle();

        if (!existing) {
          await supabase.from("roster_assignments").insert({
            personnel_id: pers.id,
            site_id: bcaSiteId,
            shift_id: assignedShift,
            date: d,
            status: "scheduled",
          });
        }
      }
    }
    console.log("  + 7-day roster assignments verified and seeded.");
  }

  console.log("\n>>> TAHAP 1 COMPLETED SUCCESSFULLY! <<<");
}

main().catch((err) => {
  console.error("FATAL ERROR IN SEEDING:", err);
  process.exit(1);
});
