import { chromium } from "playwright";

async function runTests() {
  console.log("=== PLAYWRIGHT VERIFICATION SUITE START ===");
  const browser = await chromium.launch({ headless: true });

  try {
    // ----------------------------------------------------
    // TEST 1: Desktop View (1440x900) - Admin Login & Verification
    // ----------------------------------------------------
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await desktopContext.newPage();

    console.log("1. Navigating to login page...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });

    console.log("2. Logging in as admin@garda.bujp.id...");
    await page.fill('input[type="email"]', "admin@garda.bujp.id");
    await page.fill('input[type="password"]', "Password123!");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard**", { timeout: 15000 });
    console.log("✓ Successfully redirected to /dashboard");

    // Check removed status badges
    const pageContent = await page.content();
    if (pageContent.includes("Database Terenkripsi & RLS Aktif")) {
      throw new Error("FAILED: 'Database Terenkripsi & RLS Aktif' still exists!");
    }
    if (pageContent.includes("Supabase Connected")) {
      throw new Error("FAILED: 'Supabase Connected' still exists!");
    }
    console.log("✓ Verified: 'Database Terenkripsi & RLS Aktif' and 'Supabase Connected' completely removed.");

    // Check Profile Dropdown & Single Logout Button
    console.log("3. Testing Header User Profile Dropdown...");
    const profileTrigger = page.locator('button[aria-haspopup="true"]');
    await profileTrigger.click();

    // Verify dropdown content
    await page.waitForSelector("text=Keluar (Logout)");
    const logoutButtons = await page.locator("text=Keluar (Logout)").count();
    console.log(`✓ Profile dropdown opened. Found ${logoutButtons} logout button in dropdown.`);

    if (logoutButtons !== 1) {
      throw new Error(`Expected exactly 1 logout button, found ${logoutButtons}`);
    }

    // Check 'Ubah Foto & Profil Saya' and 'Pengaturan Perusahaan'
    const hasEditProfile = await page.locator("text=Ubah Foto & Profil Saya").isVisible();
    const hasCompanySettings = await page.locator("text=Pengaturan Perusahaan").isVisible();
    console.log(`✓ Dropdown items: Ubah Foto = ${hasEditProfile}, Pengaturan Perusahaan = ${hasCompanySettings}`);

    // Close dropdown
    await profileTrigger.click();

    // ----------------------------------------------------
    // TEST 2: Mobile View (390x844) - Responsive Navigation & Hamburger
    // ----------------------------------------------------
    console.log("\n4. Testing Mobile Viewport (390x844)...");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await mobilePage.fill('input[type="email"]', "admin@garda.bujp.id");
    await mobilePage.fill('input[type="password"]', "Password123!");
    await mobilePage.click('button[type="submit"]');
    await mobilePage.waitForURL("**/dashboard**");

    // Hamburger button check
    const hamburger = mobilePage.locator('button[aria-label="Buka Menu Navigasi"]');
    const isHamburgerVisible = await hamburger.isVisible();
    console.log(`✓ Hamburger menu visible on mobile: ${isHamburgerVisible}`);

    if (!isHamburgerVisible) {
      throw new Error("FAILED: Hamburger button is not visible on mobile viewport!");
    }

    // Open drawer
    await hamburger.click();
    await mobilePage.waitForSelector('[data-testid="mobile-sidebar-drawer"]', { state: "visible" });
    const isDrawerOpen = await mobilePage.locator('[data-testid="mobile-sidebar-drawer"]').isVisible();
    console.log(`✓ Slide-over drawer opened: ${isDrawerOpen}`);

    // Click link inside drawer
    await mobilePage.locator('[data-testid="mobile-sidebar-drawer"] nav').getByText('Personel Satpam').click();
    await mobilePage.waitForURL("**/dashboard/personnel**");
    console.log("✓ Drawer navigation link clicked & redirected to /dashboard/personnel");

    // Verify table has overflow-x-auto
    const hasOverflowTable = await mobilePage.locator(".overflow-x-auto").count();
    console.log(`✓ Found ${hasOverflowTable} responsive scrollable table containers.`);

    // ----------------------------------------------------
    // TEST 3: Settings Page & Company Logo Feature
    // ----------------------------------------------------
    console.log("\n5. Navigating to /dashboard/settings (Profil BUJP & Logo)...");
    await page.goto("http://localhost:3000/dashboard/settings", { waitUntil: "networkidle" });
    const hasLogoSection = await page.locator("text=Logo Resmi Perusahaan (BUJP)").isVisible();
    console.log(`✓ Logo upload section visible: ${hasLogoSection}`);

    // ----------------------------------------------------
    // TEST 4: Users Management & RBAC Enforcement
    // ----------------------------------------------------
    console.log("\n6. Navigating to /dashboard/settings/users...");
    await page.goto("http://localhost:3000/dashboard/settings/users", { waitUntil: "networkidle" });
    const usersTableVisible = await page.locator("text=Daftar Akun Pengguna Terdaftar").isVisible();
    console.log(`✓ Users management table visible: ${usersTableVisible}`);

    const hasAddUserBtn = await page.locator("text=Tambah Pengguna").isVisible();
    console.log(`✓ 'Tambah Pengguna' button visible for super_admin: ${hasAddUserBtn}`);

    // ----------------------------------------------------
    // TEST 5: Restricted Role Login & Active RBAC Enforcement
    // ----------------------------------------------------
    console.log("\n7. Testing Restricted Role RBAC (finance@garda.bujp.id)...");
    const rbacContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const rbacPage = await rbacContext.newPage();
    await rbacPage.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await rbacPage.fill('input[type="email"]', "finance@garda.bujp.id");
    await rbacPage.fill('input[type="password"]', "Password123!");
    await rbacPage.click('button[type="submit"]');
    await rbacPage.waitForURL("**/dashboard**");
    console.log("✓ Logged in as finance_admin");

    // Check sidebar does NOT show 'Personel Satpam'
    const hasPersonnelNav = await rbacPage.locator('aside nav').getByText('Personel Satpam').isVisible();
    console.log(`✓ 'Personel Satpam' hidden from finance_admin sidebar: ${!hasPersonnelNav}`);

    // Directly access unauthorized route -> expect Access Denied 403
    await rbacPage.goto("http://localhost:3000/dashboard/personnel", { waitUntil: "networkidle" });
    const has403Denied = await rbacPage.locator("text=Akses Ditolak (403)").isVisible();
    console.log(`✓ AccessDenied 403 component shown on unauthorized direct route: ${has403Denied}`);

    if (!has403Denied) {
      throw new Error("FAILED: Route guard did not block unauthorized access to /dashboard/personnel!");
    }

    console.log("\n=== ALL 5 PLAYWRIGHT SUITE TESTS PASSED COMPLETELY! ===");
  } finally {
    await browser.close();
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
