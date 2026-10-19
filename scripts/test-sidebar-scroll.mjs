import { chromium } from "playwright";

async function testSidebarScroll() {
  console.log("🚀 Testing Sidebar Sticky/Scroll Behavior...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // 1. Login
  await page.goto("http://localhost:3000/login");
  await page.fill('input[type="email"]', "admin@garda.bujp.id");
  await page.fill('input[type="password"]', "Password123!");
  await page.click('button[type="submit"]');

  // 2. Wait for /dashboard/roster or /dashboard/personnel (long pages)
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.goto("http://localhost:3000/dashboard/roster");
  await page.waitForLoadState("networkidle");

  // 3. Measure initial position of Sidebar Brand Header
  const brandHeader = page.locator('text="GARDA ERP"').first();
  const initialBox = await brandHeader.boundingBox();
  console.log(`📌 Initial "GARDA ERP" position Y: ${initialBox.y}px`);

  // 4. Scroll the main content down by 1500px
  console.log("📜 Scrolling main content area down by 1500px...");
  await page.evaluate(() => {
    const main = document.querySelector("main");
    if (main) main.scrollTop = 1500;
    window.scrollTo(0, 1500);
  });
  await page.waitForTimeout(500);

  // 5. Check position of Sidebar Brand Header again
  const scrolledBox = await brandHeader.boundingBox();
  console.log(`📌 After scroll "GARDA ERP" position Y: ${scrolledBox.y}px`);

  if (Math.abs(scrolledBox.y - initialBox.y) > 5) {
    throw new Error(`FAIL: Sidebar moved! Initial Y=${initialBox.y}, Scrolled Y=${scrolledBox.y}`);
  }

  console.log("✅ SUCCESS: Sidebar position remained 100% pinned at the top!");
  await browser.close();
}

testSidebarScroll().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
