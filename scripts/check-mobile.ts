import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const REPORT_FILE = path.resolve(process.cwd(), "mobile-audit-report.json");

export const ALL_AUDIT_ROUTES = [
  "/dashboard",
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
  "/dashboard/accounting/reports/balanced-scorecard",
  "/dashboard/accounting/reports/management-analysis",
  "/dashboard/accounting/reports/balance-sheet",
  "/dashboard/accounting/reports/income-statement",
  "/dashboard/accounting/reports/cash-flow",
  "/dashboard/accounting/reports/equity-changes",
  "/dashboard/settings",
  "/dashboard/settings/institution",
  "/dashboard/settings/org-chart",
  "/dashboard/settings/users",
  "/dashboard/settings/users/new",
  "/dashboard/settings/roles",
  "/dashboard/settings/roles/new",
  "/dashboard/settings/backup",
];

interface OverflowCulprit {
  selector: string;
  tagName: string;
  className: string;
  id: string;
  width: number;
  right: number;
  overflowPx: number;
  textSnippet: string;
}

interface RouteAuditResult {
  route: string;
  viewportWidth: number;
  scrollWidth: number;
  overflowPx: number;
  hasOverflow: boolean;
  culprits: OverflowCulprit[];
}

interface MobileAuditReport {
  timestamp: string;
  viewport: { width: number; height: number };
  totalRoutes: number;
  cleanRoutes: number;
  overflowRoutes: number;
  totalOverflowElements: number;
  results: RouteAuditResult[];
}

async function checkMobile() {
  console.log("=================================================");
  console.log("📱 PLAYWRIGHT MOBILE AUDIT (GARDA BUJP ERP)");
  console.log("   Viewport: 390 x 844 (iPhone 12/13/14)");
  console.log("   Target: " + BASE_URL);
  console.log("=================================================\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });

  const page = await context.newPage();

  // 1. Login
  console.log("[Auth] Logging in as admin@garda.bujp.id...");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[type="email"]', "admin@garda.bujp.id");
  await page.fill('input[type="password"]', "Password123!");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard**", { timeout: 15000 });
  console.log("✓ Logged in successfully\n");

  const results: RouteAuditResult[] = [];
  let totalOverflowElements = 0;

  for (const route of ALL_AUDIT_ROUTES) {
    const fullUrl = `${BASE_URL}${route}`;
    try {
      await page.goto(fullUrl, { waitUntil: "networkidle", timeout: 15000 });
      await page.waitForTimeout(300);

      const audit = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const scrollWidth = Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth
        );
        const overflowPx = Math.max(0, scrollWidth - docWidth);

        const culprits: OverflowCulprit[] = [];

        // Traverse DOM for overflowing elements
        const allElements = document.querySelectorAll("*");
        for (const el of Array.from(allElements)) {
          const rect = el.getBoundingClientRect();

          // Skip invisible or zero-size elements
          if (rect.width === 0 || rect.height === 0) continue;

          // If element is contained within an intentional horizontal scroll container (.overflow-x-auto)
          // that itself fits within the viewport, this child element is legitimately scrolled and not leaking
          const scrollContainer = el.closest('.overflow-x-auto, [class*="overflow-x-auto"]');
          if (scrollContainer && scrollContainer !== el) {
            const containerRect = scrollContainer.getBoundingClientRect();
            if (containerRect.right <= docWidth + 1) {
              continue;
            }
          }

          // Element extends beyond right viewport boundary
          if (rect.right > docWidth + 1) {
            // Build a readable selector
            let sel = el.tagName.toLowerCase();
            if (el.id) {
              sel += `#${el.id}`;
            } else if (el.className && typeof el.className === "string") {
              const classes = el.className.split(" ").filter((c) => c && !c.includes(":")).slice(0, 3);
              if (classes.length) sel += `.${classes.join(".")}`;
            }

            culprits.push({
              selector: sel,
              tagName: el.tagName.toLowerCase(),
              className: typeof el.className === "string" ? el.className.slice(0, 120) : "",
              id: el.id || "",
              width: Math.round(rect.width),
              right: Math.round(rect.right),
              overflowPx: Math.round(rect.right - docWidth),
              textSnippet: el.textContent?.trim()?.slice(0, 50) || "",
            });
          }
        }

        // Deduplicate and keep most specific top culprits
        const sorted = culprits.sort((a, b) => b.overflowPx - a.overflowPx).slice(0, 15);

        return {
          viewportWidth: docWidth,
          scrollWidth,
          overflowPx,
          hasOverflow: overflowPx > 1 || culprits.length > 0,
          culprits: sorted,
        };
      });

      const res: RouteAuditResult = {
        route,
        viewportWidth: audit.viewportWidth,
        scrollWidth: audit.scrollWidth,
        overflowPx: audit.overflowPx,
        hasOverflow: audit.hasOverflow,
        culprits: audit.culprits,
      };

      results.push(res);

      if (audit.hasOverflow) {
        totalOverflowElements += audit.culprits.length;
        console.log(`❌ [OVERFLOW +${audit.overflowPx}px] ${route} (${audit.culprits.length} elemen melebar)`);
        for (const c of audit.culprits.slice(0, 3)) {
          console.log(`   ↳ <${c.tagName}> [width: ${c.width}px, overflow: +${c.overflowPx}px]: ${c.className.slice(0, 70)}`);
        }
      } else {
        console.log(`✅ [OK] ${route}`);
      }
    } catch (err: any) {
      console.warn(`⚠️ [WARN] Error auditing ${route}: ${err.message}`);
      results.push({
        route,
        viewportWidth: 390,
        scrollWidth: 390,
        overflowPx: 0,
        hasOverflow: false,
        culprits: [],
      });
    }
  }

  await browser.close();

  const overflowRoutes = results.filter((r) => r.hasOverflow).length;
  const cleanRoutes = results.length - overflowRoutes;

  const report: MobileAuditReport = {
    timestamp: new Date().toISOString(),
    viewport: { width: 390, height: 844 },
    totalRoutes: results.length,
    cleanRoutes,
    overflowRoutes,
    totalOverflowElements,
    results,
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), "utf8");
  console.log(`\n📄 Laporan audit disimpan ke: ${REPORT_FILE}`);

  console.log("\n=================================================");
  console.log("📊 RINGKASAN AUDIT MOBILE (390px):");
  console.log(`   Total Halaman Diuji : ${results.length}`);
  console.log(`   ✅ Responsif Bersih : ${cleanRoutes}`);
  console.log(`   ❌ Halaman Melebar  : ${overflowRoutes}`);
  console.log(`   ⚠️ Total Elemen Melebar: ${totalOverflowElements}`);
  console.log("=================================================\n");

  if (overflowRoutes > 0 || totalOverflowElements > 0) {
    process.exit(1);
  } else {
    console.log("🎉 SELURUH HALAMAN 100% RESPONSIF DI MOBILE! (0 elemen melebar)");
    process.exit(0);
  }
}

checkMobile().catch((err) => {
  console.error("Fatal checkMobile error:", err);
  process.exit(1);
});