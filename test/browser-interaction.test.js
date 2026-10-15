import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createAppServer } from "../server.js";

async function withBrowser(run) {
  const server = createAppServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`http://127.0.0.1:${address.port}/`);
    await run(page);
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
}

test("browser keyboard flow exposes the skip link and reaches main content", async () => {
  await withBrowser(async (page) => {
    await page.keyboard.press("Tab");
    const skipLink = page.locator(".skip-link");
    assert.equal(await skipLink.evaluate((element) => element === document.activeElement), true);
    const rect = await skipLink.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom };
    });
    assert.ok(rect.top >= 0 && rect.bottom <= 844, "focused skip link should be visible in the viewport");

    await page.keyboard.press("Enter");
    await page.waitForFunction(() => window.location.hash === "#main-content");
    assert.equal(await page.locator("#main-content").evaluate((element) => element.id), "main-content");
  });
});

test("browser query flow shows real fixture results and provenance", async () => {
  await withBrowser(async (page) => {
    await page.getByRole("textbox", { name: "Your question" }).fill("evidence implementation status");
    await page.getByRole("button", { name: /Search knowledge/ }).click();
    await page.getByText("Found local fixture matches. This is not a live model response.").waitFor();
    await page.getByRole("region", { name: "Knowledge result" }).waitFor();
    assert.match(await page.locator("#answer").innerText(), /distinguish documented proposals/i);
    assert.match(await page.locator("#sources").innerText(), /fixture-gaia-evidence-001/);
    assert.match(await page.locator("#health-badge").innerText(), /Local demo · not connected/);
  });
});

test("browser form rejects blank queries without issuing a request", async () => {
  await withBrowser(async (page) => {
    let queryRequests = 0;
    page.on("request", (request) => {
      if (request.url().endsWith("/api/query")) queryRequests += 1;
    });
    const input = page.getByRole("textbox", { name: "Your question" });
    await input.fill("   ");
    await page.getByRole("button", { name: /Search knowledge/ }).click();
    assert.equal(queryRequests, 0);
    assert.match(await page.locator("#feedback").innerText(), /Enter a question/);
  });
});

test("mobile workspace navigation is labelled and does not force page-wide horizontal overflow", async () => {
  await withBrowser(async (page) => {
    assert.equal(await page.getByRole("navigation", { name: "Primary workspaces" }).count(), 1);
    assert.equal(await page.getByRole("link", { name: /Knowledge Available/ }).count(), 1);
    assert.equal(await page.getByRole("button", { name: /Chat Planned/ }).isDisabled(), true);
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      page: document.documentElement.scrollWidth,
      nav: document.querySelector(".workspace-nav").scrollWidth,
      navViewport: document.querySelector(".workspace-nav").clientWidth
    }));
    assert.ok(dimensions.page <= dimensions.viewport, `page overflowed horizontally: ${JSON.stringify(dimensions)}`);
    assert.ok(dimensions.nav >= dimensions.navViewport, "workspace navigation should contain its own horizontal scroll area");
  });
});
