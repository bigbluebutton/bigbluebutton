// eslint-disable-next-line import/no-relative-packages
import defaultLocale from '../../../bigbluebutton-html5/public/locales/en';
import { elements as e } from '../core/elements.ts';

export async function openSettings(test) {
  await test.waitAndClick(e.optionsButton);
  await test.waitAndClick(e.settings);
}

export async function getLocaleValues(elements, locale) {
  const currentValues = {};
  let currentLocale = {};
  try {
    currentLocale = await import(`../../../bigbluebutton-html5/public/locales/${locale.replace('-', '_')}.json`);
  } catch (err) {
    // Ignore import errors for missing locale files
  }

  async function getValueFromSecondaryLocale(currentKey) {
    const generalLocaleName = locale.split('-')[0];
    let generalLocale = {};
    try {
      generalLocale = await import(`../../../bigbluebutton-html5/public/locales/${generalLocaleName}.json`);
    } catch (err) {
      // Ignore import errors for missing locale files
    }
    return generalLocale[currentKey] ? generalLocale[currentKey] : defaultLocale[currentKey];
  }

  await Promise.all(
    Object.entries(elements).map(async ([selector, currentKey]) => {
      currentValues[selector] = currentLocale[currentKey]
        ? currentLocale[currentKey]
        : await getValueFromSecondaryLocale(currentKey);
    })
  );
  return currentValues;
}

export async function openAboutModal(test) {
  await test.waitAndClick(e.optionsButton);
  await test.waitAndClick(e.showAboutModalButton);
}
