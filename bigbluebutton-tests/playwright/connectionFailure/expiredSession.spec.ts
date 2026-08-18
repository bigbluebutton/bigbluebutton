import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { parameters } from '../core/parameters';
import { test } from '../core/setup/fixtures';

// Every stale invite link ends up here: nginx answers 401, the client never gets its settings (nor
// an intl), and the screen used to be a bare "Oops, something went wrong" with nothing else on it.
test.describe('Expired session link', { tag: '@ci' }, () => {
  test.beforeEach(async ({ page }) => {
    // No meeting on purpose - a token bbb-web has never heard of fails exactly like an expired one.
    const clientURL = new URL('../html5client/?sessionToken=expiredsessiontoken0', parameters.server);
    await page.goto(clientURL.toString());
  });

  test('Names the ended session instead of a generic failure', async ({ page }) => {
    // The screen only paints once the settings loaders give up, which is not instant in CI.
    await expect(page.locator(e.errorScreenMessage)).toBeVisible({ timeout: 60_000 });
    await expect(page.locator(e.errorScreenCode)).toHaveText('410');
    // The actionable part: what the user can do next, not just that something broke.
    await expect(page.locator(e.errorScreenDescription)).not.toBeEmpty();
  });
});
