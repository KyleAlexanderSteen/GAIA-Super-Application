import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createAppServer } from "../server.js";

test("AI Systems Explorer renders truthful local entries and filters by category", async (t) => {
  const server = createAppServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  let browser;
  t.after(async () => {
    if (browser) await browser.close();
    await new Promise((resolve, reject) =>
      server.close((error) => error ? reject(error) : resolve())
    );
  });

  const address = server.address();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`http://127.0.0.1:${address.port}/`);

  await page.getByRole("link", { name: /AI Systems Preview/ }).click();
  await page.getByText(/7 catalogue entries/).waitFor();
  assert.equal(await page.getByRole("heading", { name: "Explore AI ecosystems and capabilities" }).count(), 1);
  assert.equal(await page.locator(".provider-card").count(), 7);
  assert.match(await page.locator("#provider-catalog").innerText(), /Nemotron/);
  assert.match(await page.locator("#provider-catalog").innerText(), /NVIDIA NIM/);
  assert.match(await page.locator("#provider-catalog").innerText(), /NVIDIA NeMo/);
  assert.match(await page.locator("#provider-catalog").innerText(), /Earth-2/);
  assert.match(await page.locator("#provider-catalog").innerText(), /Cosmos/);
  assert.match(await page.locator("#provider-catalog").innerText(), /unconfigured/);
  assert.match(await page.locator("#provider-catalog").innerText(), /unverified/);

  await page.getByRole("combobox", { name: "Filter by category" }).selectOption("specialized_system");
  assert.equal(await page.locator(".provider-card").count(), 2);
  assert.match(await page.locator("#provider-catalog").innerText(), /Earth-2/);
  assert.match(await page.locator("#provider-catalog").innerText(), /Cosmos/);
  assert.doesNotMatch(await page.locator("#provider-catalog").innerText(), /Nemotron/);

  await page.getByRole("combobox", { name: "Filter by capability" }).selectOption("reasoning");
  assert.match(await page.locator("#catalog-status").innerText(), /No catalogue entries match/);
  assert.equal(await page.locator(".provider-card").count(), 0);

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth
  }));
  assert.ok(dimensions.page <= dimensions.viewport, `page overflowed horizontally: ${JSON.stringify(dimensions)}`);
});
