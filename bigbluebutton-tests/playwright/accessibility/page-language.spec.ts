import { Browser, expect, Page as PlaywrightPage } from '@playwright/test';

import { elements as e } from '../core/elements';
import { parameters } from '../core/parameters';
import { test } from '../core/setup/fixtures';
import { openSettings } from '../options/util';
import { MultiUsers } from '../user/multiusers';

// WCAG 2.2 SC 3.1.1 (Language of Page): every screen, including the ones shown before the user is
// in the room, marks the page with the language its text is in.

async function newPageInLocale(browser: Browser, locale: string): Promise<PlaywrightPage> {
  const context = await browser.newContext({ locale });
  return context.newPage();
}

async function expectPageLanguage(page: PlaywrightPage, lang: string, dir: 'ltr' | 'rtl') {
  const html = page.locator('html');
  await expect(html, `should mark the page as "${lang}"`).toHaveAttribute('lang', lang);
  await expect(html, `should set the "${dir}" direction`).toHaveAttribute('dir', dir);
}

const ERROR_SCREENS = [
  { name: 'an invalid session link', path: '../html5client/?sessionToken=doesnotexist123' },
  { name: 'a link without a session token', path: '../html5client/' },
];

const LANGUAGES = [
  { locale: 'pt-BR', lang: 'pt-BR', dir: 'ltr' as const },
  { locale: 'ar', lang: 'ar', dir: 'rtl' as const },
  // only English is shown for en-US, so the page is marked as plain English
  { locale: 'en-US', lang: 'en', dir: 'ltr' as const },
];

test.describe.parallel('Language of page', { tag: '@ci' }, () => {
  ERROR_SCREENS.forEach(({ name, path }) => {
    LANGUAGES.forEach(({ locale, lang, dir }) => {
      test(`error screen for ${name} in ${locale}`, async ({ browser }) => {
        const page = await newPageInLocale(browser, locale);
        await page.goto(new URL(path, parameters.server).toString());
        await expect(page.locator(e.errorScreenMessage), 'should show the error screen').toBeVisible();
        await expectPageLanguage(page, lang, dir);
      });
    });
  });

  test('guest lobby in pt-BR', async ({ browser, context, page }, testInfo) => {
    const session = new MultiUsers(browser, context);
    await session.initModPage(page, { createParameter: 'guestPolicy=ASK_MODERATOR', testInfo });
    const guestContext = await browser.newContext({ locale: 'pt-BR' });
    await session.initUserPage(guestContext, {
      fullName: 'Guest',
      joinParameter: 'guest=true',
      shouldCloseAudioModal: false,
      shouldCheckAllInitialSteps: false,
    });
    await session.userPage.hasElement(e.guestMessage, 'should keep the guest in the lobby');
    await expectPageLanguage(session.userPage.page, 'pt-BR', 'ltr');
  });

  test('follows the catalog that loaded when the requested one fails', async ({ browser, context }, testInfo) => {
    const arabicContext = await browser.newContext({ locale: 'ar' });
    // the Arabic catalog fails, so the client shows the English fallback
    await arabicContext.route(/\/locales\/ar\.json/, (route) => route.fulfill({ status: 404, body: 'not found' }));
    const session = new MultiUsers(browser, context);
    await session.initModPage(await arabicContext.newPage(), { testInfo });
    await expectPageLanguage(session.modPage.page, 'en', 'ltr');
  });
});

// WCAG 2.2 SC 3.1.2 (Language of Parts): in "Deutsch - German", only "Deutsch" is German.
test.describe.parallel('Language of parts', { tag: '@ci' }, () => {
  test('language list marks only the native name', async ({ browser, context, page }, testInfo) => {
    const session = new MultiUsers(browser, context);
    await session.initModPage(page, { testInfo });
    const { modPage } = session;

    await openSettings(modPage);
    await modPage.waitAndClick(e.languageSelector);
    const german = modPage.page.locator(`${e.languageSelectorOption}[data-value="de"]`);
    await expect(german, 'should list German with its English name').toHaveText('Deutsch - German');
    await expect(german, 'should not mark the whole option as German').not.toHaveAttribute('lang');
    await expect(german.locator('[lang="de"]'), 'should mark only the native name as German').toHaveText('Deutsch');
  });
});
