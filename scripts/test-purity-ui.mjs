import { chromium } from "playwright";

async function captureDashboard() {
  console.log("🚀 Starting Playwright visual check on Purity UI Dashboard...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1. Login
  await page.goto("http://localhost:3000/login");
  await page.fill('input[type="email"]', "admin@garda.bujp.id");
  await page.fill('input[type="password"]', "Password123!");
  await page.click('button[type="submit"]');

  // 2. Wait for /dashboard
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForLoadState("networkidle");
  console.log("✅ Reached /dashboard");

  // Capture Dark mode screenshot
  await page.screenshot({ path: "scripts/purity-dashboard-dark.png", fullPage: true });
  console.log("📸 Saved scripts/purity-dashboard-dark.png");

  // 3. Switch to Light mode
  const toggleBtn = page.locator('button[aria-label*="Tema"]').first();
  await toggleBtn.click();
  await page.waitForTimeout(600);

  // Capture Light mode screenshot
  await page.screenshot({ path: "scripts/purity-dashboard-light.png", fullPage: true });
  console.log("📸 Saved scripts/purity-dashboard-light.png");

  await browser.close();
  console.log("🎉 Visual capture complete!");
}

captureDashboard().catch((err) => {
  console.error("❌ Visual capture failed:", err);
  process.exit(1);
});
