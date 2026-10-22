import { readFileSync } from 'fs';
import { join } from 'path';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';

// Load the default locale on first use, so a missing file fails only the tests that need it
let defaultLocale: Record<string, string> | undefined;
function getDefaultLocale(): Record<string, string> {
  if (!defaultLocale) {
    const defaultLocalePath = join(__dirname, '../../../bigbluebutton-html5/public/locales/en.json');
    defaultLocale = JSON.parse(readFileSync(defaultLocalePath, 'utf8')) as Record<string, string>;
  }
  return defaultLocale;
}

export async function openSettings(testPage: Page) {
  await testPage.waitAndClick(e.settingsSidebarButton);
}

export async function getLocaleValues(
  elements: Record<string, string>,
  locale: string,
): Promise<Record<string, string>> {
  const currentValues = {};
  let currentLocale: Record<string, string> = {};
  try {
    const localeFileName = `${locale.replace('-', '_')}.json`;
    const localePath = join(__dirname, '../../../bigbluebutton-html5/public/locales', localeFileName);
    const localeContent = readFileSync(localePath, 'utf8');
    currentLocale = JSON.parse(localeContent);
  } catch {
    // Ignore import errors for missing locale files
  }

  async function getValueFromSecondaryLocale(currentKey: string): Promise<string> {
    const generalLocaleName = locale.split('-')[0];
    let generalLocale: Record<string, string> = {};
    try {
      const generalLocaleFileName = `${generalLocaleName}.json`;
      const generalLocalePath = join(__dirname, '../../../bigbluebutton-html5/public/locales', generalLocaleFileName);
      const generalLocaleContent = readFileSync(generalLocalePath, 'utf8');
      generalLocale = JSON.parse(generalLocaleContent);
    } catch {
      // Ignore import errors for missing locale files
    }
    return generalLocale[currentKey] ? generalLocale[currentKey] : getDefaultLocale()[currentKey];
  }

  for (const [element, key] of Object.entries(elements)) {
    (currentValues as Record<string, string>)[element] = currentLocale[key]
      ? currentLocale[key]
      : await getValueFromSecondaryLocale(key);
  }

  return currentValues;
}

export async function selectLocale(testPage: Page, locale: string) {
  await openSettings(testPage);
  await testPage.page.locator(e.languageSelector).selectOption({ value: locale });
  await testPage.waitAndClick(e.saveSettingsButton);
}

export async function getHtmlFontSize(testPage: Page): Promise<string> {
  return testPage.page.locator('html').evaluate((node) => getComputedStyle(node).fontSize);
}

// Horizontal center of an element, to tell which side of the viewport it sits on.
export async function getCenterX(testPage: Page, selector: string): Promise<number> {
  const box = await testPage.page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`${selector} has no bounding box`);
  return box.x + box.width / 2;
}

export async function openAboutModal(testPage: Page) {
  await testPage.waitAndClick(e.settingsSidebarButton);
  await testPage.waitAndClick(e.aboutTabButton);
}
