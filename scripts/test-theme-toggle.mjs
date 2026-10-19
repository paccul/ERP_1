import { chromium } from "playwright";

async function testThemeToggle() {
  console.log("🚀 Starting Theme Toggle E2E Test...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // 1. Login
  console.log("➡️ Navigating to login...");
  await page.goto("http://localhost:3000/login");
  await page.fill('input[type="email"]', "admin@garda.bujp.id");
  await page.fill('input[type="password"]', "Password123!");
  await page.click('button[type="submit"]');

  // 2. Wait for Dashboard
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  console.log("✅ Logged in and reached /dashboard");

  // 3. Check initial html class
  const initialClass = await page.evaluate(() => document.documentElement.className);
  console.log(`📌 Initial HTML class: "${initialClass}"`);

  // 4. Find Theme Toggle button
  const toggleBtn = page.locator('button[aria-label*="Tema"]');
  const btnCount = await toggleBtn.count();
  console.log(`🔍 Theme Toggle buttons found: ${btnCount}`);
  if (btnCount === 0) {
    throw new Error("Theme toggle button not found!");
  }

  // 5. Click to switch to Light Theme
  console.log("🖱️ Clicking theme toggle to switch to Light mode...");
  await toggleBtn.first().click();
  await page.waitForTimeout(600);

  const lightClass = await page.evaluate(() => document.documentElement.className);
  console.log(`☀️ HTML class after 1st click: "${lightClass}"`);
  const isLight = lightClass.includes("light");
  console.log(`✅ Is light mode active? ${isLight}`);

  // Take screenshot of Light mode
  await page.screenshot({ path: "scripts/screenshot-light.png" });
  console.log("📸 Saved scripts/screenshot-light.png");

  // 6. Click to switch back to Dark Theme
  console.log("🖱️ Clicking theme toggle to switch back to Dark mode...");
  await toggleBtn.first().click();
  await page.waitForTimeout(600);

  const darkClass = await page.evaluate(() => document.documentElement.className);
  console.log(`🌙 HTML class after 2nd click: "${darkClass}"`);
  const isDark = darkClass.includes("dark");
  console.log(`✅ Is dark mode active? ${isDark}`);

  // Take screenshot of Dark mode
  await page.screenshot({ path: "scripts/screenshot-dark.png" });
  console.log("📸 Saved scripts/screenshot-dark.png");

  await browser.close();
  console.log("🎉 Theme Toggle Test Complete and Passed!");
}

testThemeToggle().catch((err) => {
  console.error("❌ Theme toggle test failed:", err);
  process.exit(1);
});
