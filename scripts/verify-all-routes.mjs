import { chromium } from "playwright";

const BASE_URL = "http://localhost:3000";

const ROUTES_TO_TEST = [
  // 1. Core & Dashboard
  "/dashboard",

  // 2. Personel Satpam (SEC)
  "/dashboard/personnel",
  "/dashboard/personnel/new",

  // 3. Rekrutmen Satpam Baru (PSB)
  "/dashboard/recruitment",

  // 4. Klien Mitra & Sites (SEC)
  "/dashboard/clients",
  "/dashboard/clients/new",
  "/dashboard/sites",
  "/dashboard/sites/new",
  "/dashboard/checkpoints",

  // 5. Roster & BKO (SEC)
  "/dashboard/roster",
  "/dashboard/roster/new",
  "/dashboard/bko-requests",

  // 6. Logistik & Perlengkapan (LOG)
  "/dashboard/logistics",
  "/dashboard/logistics/new",
  "/dashboard/logistics/distribution",
  "/dashboard/logistics/history",

  // 7. Invoicing & Tagihan (FIN)
  "/dashboard/invoices",
  "/dashboard/invoices/new",

  // 8. Penggajian / Payroll (FIN)
  "/dashboard/payroll",
  "/dashboard/payroll/new",

  // 9. Akuntansi & Laporan (ACC & RPT)
  "/dashboard/accounting",
  "/dashboard/accounting/coa",
  "/dashboard/accounting/coa/new",
  "/dashboard/accounting/journals",
  "/dashboard/accounting/journals/new",
  "/dashboard/accounting/ledger",
  "/dashboard/accounting/receivables",
  "/dashboard/accounting/reports",
  "/dashboard/accounting/reports/balanced-scorecard",
  "/dashboard/accounting/reports/management-analysis",

  // 10. Pengaturan Sistem & Organisasi (SET - 8 Layar)
  "/dashboard/settings",
  "/dashboard/settings/institution",
  "/dashboard/settings/org-chart",
  "/dashboard/settings/users",
  "/dashboard/settings/users/new",
  "/dashboard/settings/roles",
  "/dashboard/settings/roles/new",
  "/dashboard/settings/backup",
];

async function runAudit() {
  console.log("=================================================");
  console.log("🚀 STARTING E2E 404 AUDIT & PLAYWRIGHT CRAWLER");
  console.log("=================================================\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];
  let failCount = 0;

  // Track console errors
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  // 1. LOGIN
  console.log("[1/3] Melakukan autentikasi di /login...");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', "admin@garda.bujp.id");
  await page.fill('input[type="password"]', "Password123!");
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  console.log("✓ Berhasil login sebagai admin@garda.bujp.id dan redirect ke /dashboard.\n");

  // 2. CRAWL ALL ROUTES
  console.log(`[2/3] Menguji seluruh ${ROUTES_TO_TEST.length} rute sistem secara berurutan...`);

  for (const route of ROUTES_TO_TEST) {
    const url = `${BASE_URL}${route}`;
    try {
      const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
      const status = response ? response.status() : 0;
      const content = await page.content();

      const title = await page.title();
      const headingText = await page.locator("h1, h2").allInnerTexts();
      const is404Heading = headingText.some((h) => h.includes("404") || h.includes("This page could not be found"));
      const is404Title = title.includes("404");

      const has404 = status === 404 || is404Heading || is404Title;

      if (status === 200 && !has404) {
        console.log(`  ✓ [200 OK] ${route} (${title})`);
        results.push({ route, status: 200, title, statusText: "PASSED" });
      } else {
        console.error(`  ✗ [FAIL ${status}] ${route} (404 detected: ${has404}, Title: ${title})`);
        results.push({ route, status, title, statusText: "FAILED_404" });
        failCount++;
      }
    } catch (err) {
      console.error(`  ✗ [ERROR] ${route}: ${err.message}`);
      results.push({ route, status: 500, statusText: `ERROR: ${err.message}` });
      failCount++;
    }
  }

  // 3. TEST SETTINGS FORM SUBMISSION (DATABASE BINDING)
  console.log("\n[3/3] Menguji interaktivitas form di /dashboard/settings (Mutasi DB)...");
  await page.goto(`${BASE_URL}/dashboard/settings`, { waitUntil: "networkidle" });

  const phoneInput = page.locator('input[id="phone"]');
  const currentPhone = await phoneInput.inputValue();
  const testPhone = "021-52994499";

  await phoneInput.fill(testPhone);
  await page.click('button[type="submit"]:has-text("Simpan Profil")');

  // Wait for success alert
  const successBadge = page.locator("text=berhasil diperbarui ke database");
  await successBadge.waitFor({ state: "visible", timeout: 10000 });
  console.log("✓ Form berhasil disubmit dan menerima respons sukses dari Server Action!");

  // Re-verify value persists on reload
  await page.reload({ waitUntil: "networkidle" });
  const reloadedPhone = await page.locator('input[id="phone"]').inputValue();
  if (reloadedPhone === testPhone) {
    console.log(`✓ Verifikasi database: Nilai nomor telepon berhasil diperbarui ke '${testPhone}'.`);
  } else {
    console.warn(`! Peringatan: Nomor telepon setelah reload adalah '${reloadedPhone}'.`);
  }

  // Restore phone
  await page.locator('input[id="phone"]').fill(currentPhone || "021-52994400");
  await page.click('button[type="submit"]:has-text("Simpan Profil")');
  await page.waitForTimeout(1500);

  await browser.close();

  console.log("\n=================================================");
  console.log(`🏁 AUDIT SELESAI: Total ${results.length} rute diuji`);
  console.log(`   LULUS (200 OK): ${results.length - failCount}`);
  console.log(`   GAGAL (404/Error): ${failCount}`);
  console.log("=================================================");

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAudit().catch((err) => {
  console.error("Audit fatal error:", err);
  process.exit(1);
});
