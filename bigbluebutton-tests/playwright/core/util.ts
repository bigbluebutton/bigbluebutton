import { expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

interface ClipObj {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WbBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// The shipped English locale. Assertions on user-facing copy resolve through it rather than
// repeating the string, so a wording change shows up as one edit in en.json. Loaded on first use,
// so a missing file fails only the tests that need it.
let defaultLocale: Record<string, string> | undefined;
export function getDefaultLocale(): Record<string, string> {
  if (!defaultLocale) {
    const defaultLocalePath = join(__dirname, '../../../bigbluebutton-html5/public/locales/en.json');
    defaultLocale = JSON.parse(readFileSync(defaultLocalePath, 'utf8')) as Record<string, string>;
  }
  return defaultLocale;
}

// Text
export async function checkTextContent(
  baseContent: string,
  checkData: string | string[],
  description?: string,
): Promise<void> {
  const dataArray = typeof checkData === 'string' ? [checkData] : checkData;

  dataArray.forEach((word) => {
    expect(baseContent, description ?? `should contain the value "${word}"`).toContain(word);
  });
}

/**
 * Resolve a locale key to the string the client renders for it under the default locale.
 * @param key The locale key, e.g. 'app.talkingIndicator.hiddenUser'.
 * @returns The value from en.json.
 */
export function getDefaultLocaleValue(key: string): string {
  const value = getDefaultLocale()[key];
  expect(value, `locale key "${key}" should exist in en.json`).toBeDefined();
  return value;
}

export function constructClipObj(wbBox: WbBox): ClipObj {
  return {
    x: wbBox.x,
    y: wbBox.y,
    width: wbBox.width,
    height: wbBox.height,
  };
}
