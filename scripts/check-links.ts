import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const REPORT_FILE = path.resolve(process.cwd(), "broken-links-report.json");

// Daftar seluruh 42 rute spesifikasi PRD & rute operasional Garda ERP
export const ALL_PRD_ROUTES = [
  // 1. Core
  "/login",
  "/dashboard",

  // 2. Modul SEC - Operasional Pengamanan (10 Layar Referensi)
  "/security/personnel",
  "/security/personnels",
  "/security/personnel/new",
  "/security/personnels/new",
  "/security/personnel/edit/d0000000-0000-0000-0000-000000000001",
  "/security/clients",
  "/security/clients/new",
  "/security/sites",
  "/security/sites/new",
  "/security/checkpoints",
  "/security/roster",
  "/security/rostering",
  "/security/roster/new",
  "/security/rostering/new",
  "/security/bko-requests",
  "/security/bko",

  // 3. Modul PSB - Rekrutmen Satpam Baru (2 Layar Referensi)
  "/psb/admin",
  "/psb/admin/applicants",
  "/psb/admin/applicant-detail",
  "/psb/admin/detail/14",

  // 4. Modul LOG - Logistik & Perlengkapan Jaga (5 Layar Referensi)
  "/logistics/warehouse",
  "/logistics/items/new",
  "/logistics/items/detail/e0000000-0000-0000-0000-000000000001",
  "/logistics/items/edit/e0000000-0000-0000-0000-000000000001",
  "/logistics/distribution",
  "/logistics/distribute",

  // 5. Modul FIN - Keuangan Operasional (3 Layar Referensi)
  "/finance/invoices",
  "/finance/invoice/new",
  "/finance/invoices/new",
  "/finance/payroll",

  // 6. Modul ACC - Akuntansi Inti (4 Layar Referensi)
  "/finance/accounting/coa",
  "/finance/accounting/coa/new",
  "/finance/accounting/journals",
  "/finance/accounting/journals/new",

  // 7. Modul RPT - Laporan Keuangan & Manajemen BUJP (8 Layar Referensi)
  "/finance/accounting/reports/ledger",
  "/finance/accounting/reports/general-ledger",
  "/finance/accounting/reports/receivables",
  "/finance/accounting/reports/subsidiary-ledger",
  "/finance/accounting/reports/income-statement",
  "/finance/accounting/reports/profit-loss",
  "/finance/accounting/reports/balance-sheet",
  "/finance/accounting/reports/equity-changes",
  "/finance/accounting/reports/cash-flow",
  "/finance/accounting/reports/management-analysis",
  "/finance/accounting/reports/management",
  "/finance/accounting/reports/balanced-scorecard",

  // 8. Modul SET - Pengaturan Sistem & Identitas (8 Layar Referensi)
  "/settings/institution",
  "/settings/institution/visual",
  "/settings/org-chart",
  "/settings/users",
  "/settings/users/new",
  "/settings/roles",
  "/settings/roles/new",
  "/settings/roles/edit/1",
  "/settings/backup",
  "/settings/data",

  // 9. Dashboard Direct Routes
  "/dashboard/personnel",
  "/dashboard/personnel/new",
  "/dashboard/recruitment",
  "/dashboard/clients",
  "/dashboard/clients/new",
  "/dashboard/sites",
  "/dashboard/sites/new",
  "/dashboard/checkpoints",
  "/dashboard/roster",
  "/dashboard/roster/new",
  "/dashboard/bko-requests",
  "/dashboard/logistics",
  "/dashboard/logistics/new",
  "/dashboard/logistics/distribution",
  "/dashboard/logistics/history",
  "/dashboard/invoices",
  "/dashboard/invoices/new",
  "/dashboard/payroll",
  "/dashboard/payroll/new",
  "/dashboard/accounting",
  "/dashboard/accounting/coa",
  "/dashboard/accounting/coa/new",
  "/dashboard/accounting/journals",
  "/dashboard/accounting/journals/new",
  "/dashboard/accounting/ledger",
  "/dashboard/accounting/receivables",
  "/dashboard/accounting/reports",
  "/dashboard/accounting/reports/balance-sheet",
  "/dashboard/accounting/reports/balanced-scorecard",
  "/dashboard/accounting/reports/cash-flow",
  "/dashboard/accounting/reports/equity-changes",
  "/dashboard/accounting/reports/income-statement",
  "/dashboard/accounting/reports/management-analysis",
  "/dashboard/settings",
  "/dashboard/settings/institution",
  "/dashboard/settings/org-chart",
  "/dashboard/settings/users",
  "/dashboard/settings/users/new",
  "/dashboard/settings/roles",
  "/dashboard/settings/roles/new",
  "/dashboard/settings/backup",
];

interface RouteResult {
  route: string;
  status: number;
  title: string;
  is404: boolean;
  error?: string;
}

interface AuditReport {
  timestamp: string;
  baseUrl: string;
  totalScanned: number;
  passedCount: number;
  failedCount: number;
  failedRoutes: RouteResult[];
  passedRoutes: RouteResult[];
}

async function checkLinks() {
  console.log("=================================================");
  console.log("🔍 PLAYWRIGHT LINK & 404 AUDIT CRAWLER (GARDA ERP)");
  console.log(`🌐 Target: ${BASE_URL}`);
  console.log(`📋 Total Rute Terdaftar: ${ALL_PRD_ROUTES.length}`);
  console.log("=================================================\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  // 1. Handle Autentikasi jika diperlukan
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded", timeout: 10000 });
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    if ((await emailInput.count()) > 0) {
      console.log("[Auth] Mengisi kredensial login admin...");
      await emailInput.fill("admin@garda.bujp.id");
      await page.fill('input[name="password"], input[type="password"]', "Password123!");
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }
  } catch (err: any) {
    console.warn("[Auth Warning] Gagal bypass login:", err.message);
  }

  const passedRoutes: RouteResult[] = [];
  const failedRoutes: RouteResult[] = [];

  for (let i = 0; i < ALL_PRD_ROUTES.length; i++) {
    const route = ALL_PRD_ROUTES[i];
    const fullUrl = `${BASE_URL}${route}`;

    let routePassed = false;
    let lastResult: RouteResult | null = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await page.goto(fullUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
        const status = response ? response.status() : 0;
        const title = await page.title();
        const bodyText = (await page.locator("body").innerText()).toLowerCase();

        // Deteksi halaman 404 Next.js
        const is404 =
          status === 404 ||
          title.includes("404") ||
          bodyText.includes("404: this page could not be found") ||
          bodyText.includes("this page could not be found");

        if (!is404 && status > 0 && status < 400) {
          console.log(`  ✅ [${status}] ${route}`);
          passedRoutes.push({
            route,
            status,
            title,
            is404: false,
          });
          routePassed = true;
          break;
        } else {
          lastResult = {
            route,
            status: status || 404,
            title,
            is404: true,
          };
          if (attempt === 1) {
            await page.waitForTimeout(1000);
          }
        }
      } catch (err: any) {
        lastResult = {
          route,
          status: 500,
          title: "Error",
          is404: true,
          error: err.message,
        };
        if (attempt === 1) {
          await page.waitForTimeout(1500);
        }
      }
    }

    if (!routePassed && lastResult) {
      console.error(`  ❌ [${lastResult.status}] ${route} -> ${lastResult.error || "404 NOT FOUND"}`);
      failedRoutes.push(lastResult);
    }
  }

  await browser.close();

  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalScanned: ALL_PRD_ROUTES.length,
    passedCount: passedRoutes.length,
    failedCount: failedRoutes.length,
    failedRoutes,
    passedRoutes,
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), "utf8");
  console.log(`\n📄 Laporan audit disimpan ke: ${REPORT_FILE}`);

  console.log("\n=================================================");
  console.log(`📊 RINGKASAN AUDIT LINK:`);
  console.log(`   Total Diperiksa : ${ALL_PRD_ROUTES.length}`);
  console.log(`   ✅ Berhasil (200): ${passedRoutes.length}`);
  console.log(`   ❌ Bermasalah   : ${failedRoutes.length}`);
  console.log("=================================================");

  if (failedRoutes.length > 0) {
    console.error(`\n⚠️  Ditemukan ${failedRoutes.length} rute bermasalah (404/Error).`);
    process.exit(1);
  } else {
    console.log("\n🎉 SELURUH RUTE VALID & BEBAS DARI 404! (0 rute bermasalah)");
    process.exit(0);
  }
}

checkLinks().catch((err) => {
  console.error("Fatal check-links error:", err);
  process.exit(1);
});
