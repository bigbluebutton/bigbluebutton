import { readFileSync } from 'fs';
import { join } from 'path';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';

// Load default locale
const defaultLocalePath = join(__dirname, '../../../bigbluebutton-html5/public/locales/en.json');
const defaultLocale = JSON.parse(readFileSync(defaultLocalePath, 'utf8'));

export async function openSettings(testPage: Page) {
  await testPage.waitAndClick(e.optionsButton);
  await testPage.waitAndClick(e.settings);
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
    return generalLocale[currentKey]
      ? generalLocale[currentKey]
      : (defaultLocale as Record<string, string>)[currentKey];
  }

  for (const [element, key] of Object.entries(elements)) {
    (currentValues as Record<string, string>)[element] = currentLocale[key]
      ? currentLocale[key]
      : await getValueFromSecondaryLocale(key);
  }

  return currentValues;
}

export async function openAboutModal(testPage: Page) {
  await testPage.waitAndClick(e.optionsButton);
  await testPage.waitAndClick(e.showAboutModalButton);
}
