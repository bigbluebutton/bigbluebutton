import { expect } from '@playwright/test';

import { Page } from '../core/page';
import { test } from '../core/setup/fixtures';
import { findNonTextContrastViolations, formatNonTextContrastViolations } from './nonTextContrast';

test.describe.parallel('Accessibility', { tag: '@ci' }, () => {
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
