import { expect } from '@playwright/test';

import { Page } from '../core/page';
import { test } from '../core/setup/fixtures';
import { findNonTextContrastViolations, formatNonTextContrastViolations } from './nonTextContrast';

// TODO(4.0 a11y): @need-update excludes this from gating CI. This test was merged from
// v3.0.x-develop alongside its border-contrast improvements (colorBorder #7E8C99), but 4.0
// uses lighter design-team borders (colorBorder #B8C9D8, colorBlueLightest #E4ECF2,
// defaultBorder #B0BDC9) that don't meet WCAG 1.4.11 (3:1). Re-enable once 4.0's border
// colors get an accessibility pass.
test.describe.parallel('Accessibility', { tag: ['@ci', '@need-update'] }, () => {
  test('visible non-text boundaries have sufficient contrast', async ({ browser, page }, testInfo) => {
    const meetingPage = new Page(browser, page, testInfo);
    await meetingPage.init(true, { testInfo });

    const violations = await findNonTextContrastViolations(meetingPage.page);

    await testInfo.attach('non-text-contrast-violations.json', {
      body: JSON.stringify(violations, null, 2),
      contentType: 'application/json',
    });

    expect(violations, formatNonTextContrastViolations(violations)).toEqual([]);
  });
});
