/**
 * Locale lookup for the error screen when it renders outside an IntlProvider. IntlLoader needs the
 * client settings SettingsLoader fetches, so the failure users hit most - an expired link, where
 * that fetch is what fails - has no intl at all. The locale files are static and public, so fetch
 * them straight from there.
 *
 * Deliberately simpler than intlLoader: no retries, no locale index, no user override. It does
 * mirror one thing - English underneath the requested language - because translations lag the
 * catalog and a missing key must not leave the screen with nothing to say.
 */

export type LocaleMessages = Record<string, string>;

const BASE_LOCALE = 'en';

/** Locale files are `xx.json` or `xx_YY.json`; most specific first. */
export const localeCandidates = (language: string): string[] => {
  const [lang, region] = language.replace(/-/g, '_').split('_');

  if (!lang || lang.toLowerCase() === BASE_LOCALE) return [];

  return region ? [`${lang}_${region.toUpperCase()}`, lang] : [lang];
};

const fetchLocale = async (locale: string, signal?: AbortSignal): Promise<LocaleMessages | null> => {
  try {
    const response = await fetch(`locales/${locale}.json`, { signal });

    return response.ok ? await response.json() : null;
  } catch {
    // Missing, malformed, aborted, offline - all mean "no messages", which the caller handles.
    return null;
  }
};

const fetchFirstAvailable = async (
  locales: string[],
  signal?: AbortSignal,
): Promise<LocaleMessages | null> => {
  // eslint-disable-next-line no-restricted-syntax
  for (const locale of locales) {
    if (signal?.aborted) break;

    // Sequential on purpose: the fallback is only worth requesting if the specific file is missing.
    // eslint-disable-next-line no-await-in-loop
    const messages = await fetchLocale(locale, signal);

    if (messages) return messages;
  }

  return null;
};

const fetchStandaloneLocale = async (signal?: AbortSignal): Promise<LocaleMessages> => {
  const language = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
  const [base, localized] = await Promise.all([
    fetchLocale(BASE_LOCALE, signal),
    fetchFirstAvailable(localeCandidates(language), signal),
  ]);

  return { ...base, ...localized };
};

export default fetchStandaloneLocale;
