import { expect } from '@playwright/test';

import { bundleNameOf } from '../core/clientBuild';
import { Page } from '../core/page';
import { test } from '../core/setup/fixtures';

const dist = process.env.BBB_CLIENT_DIST;

test.describe('Client build under test', { tag: '@layout' }, () => {
  test.skip(!dist, 'BBB_CLIENT_DIST is not set');

  test('The page runs the bundle of the served dist, not the server client', async ({ browser, page }, testInfo) => {
    const loaded: string[] = [];
    page.on('request', (request) => {
      const match = new URL(request.url()).pathname.match(/^\/html5client\/(bundle\.[^/]+\.js)$/);
      if (match) loaded.push(match[1]);
    });
    const modPage = new Page(browser, page, testInfo);
    await modPage.init(true, { testInfo });
    const scriptSrcs = await page.evaluate(() =>
      Array.from(document.scripts)
        .map((s) => s.src)
        .filter((src) => /\/bundle\./.test(src)),
    );
    expect(loaded, 'the main bundle request').toContain(bundleNameOf(dist!));
    expect(scriptSrcs.map((src) => new URL(src).pathname)).toContain(`/html5client/${bundleNameOf(dist!)}`);
  });
});
