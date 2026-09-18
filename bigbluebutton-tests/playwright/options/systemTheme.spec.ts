import { linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { SystemTheme } from './systemTheme';

// Issue 23496: automatic light/dark theme switching driven by the operating
// system's prefers-color-scheme. The OS preference is emulated with
// page.emulateMedia({ colorScheme }); it must be set before the client boots so
// it is picked up as the initial theme default.
test.describe('System theme (prefers-color-scheme)', { tag: '@ci' }, () => {
  test.beforeEach(() => {
    linkIssue(23496);
  });

  test('applies the dark theme on load when the OS prefers dark', async ({ browser, context, page }, testInfo) => {
    const systemTheme = new SystemTheme(browser, context);
    await page.emulateMedia({ colorScheme: 'dark' });
    await systemTheme.initModPage(page, { testInfo });

    test.skip(
      !(await systemTheme.isAutoDetectConfigured()),
      'requires public.app.darkTheme.autoDetectFromSystem to be enabled on the server under test',
    );

    await systemTheme.expectDarkTheme(true, 'should apply the dark theme because the OS prefers dark');
  });

  test('keeps the light theme on load when the OS prefers light', async ({ browser, context, page }, testInfo) => {
    const systemTheme = new SystemTheme(browser, context);
    await page.emulateMedia({ colorScheme: 'light' });
    await systemTheme.initModPage(page, { testInfo });

    test.skip(
      !(await systemTheme.isAutoDetectConfigured()),
      'requires public.app.darkTheme.autoDetectFromSystem to be enabled on the server under test',
    );

    await systemTheme.expectDarkTheme(false, 'should keep the light theme because the OS prefers light');
  });

  test('switches the theme live when the OS preference changes', async ({ browser, context, page }, testInfo) => {
    const systemTheme = new SystemTheme(browser, context);
    await page.emulateMedia({ colorScheme: 'light' });
    await systemTheme.initModPage(page, { testInfo });

    test.skip(
      !(await systemTheme.isAutoDetectConfigured()),
      'requires public.app.darkTheme.autoDetectFromSystem to be enabled on the server under test',
    );

    await systemTheme.expectDarkTheme(false, 'should start in the light theme');
    await page.emulateMedia({ colorScheme: 'dark' });
    await systemTheme.expectDarkTheme(true, 'should switch to dark when the OS switches to dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await systemTheme.expectDarkTheme(false, 'should switch back to light when the OS switches to light');
  });

  test('a manual theme choice overrides the OS preference', async ({ browser, context, page }, testInfo) => {
    const systemTheme = new SystemTheme(browser, context);
    await page.emulateMedia({ colorScheme: 'dark' });
    await systemTheme.initModPage(page, { testInfo });

    test.skip(
      !(await systemTheme.isAutoDetectConfigured()),
      'requires public.app.darkTheme.autoDetectFromSystem to be enabled on the server under test',
    );

    await systemTheme.expectDarkTheme(true, 'should start in the dark theme following the OS');
    // Explicitly turn dark mode off, recording a user preference for light.
    await systemTheme.setDarkModeManually();
    await systemTheme.expectDarkTheme(false, 'should apply light after the user turns dark mode off');
    // The OS preference toggling must no longer change the theme.
    await page.emulateMedia({ colorScheme: 'light' });
    await page.emulateMedia({ colorScheme: 'dark' });
    await systemTheme.expectDarkTheme(false, 'should keep the manual light choice even when the OS prefers dark');
  });
});
