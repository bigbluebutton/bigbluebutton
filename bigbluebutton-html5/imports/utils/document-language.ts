import { formatLocaleCode } from '/imports/utils/string-utils';

export const RTL_LANGUAGES = ['ar', 'dv', 'fa', 'he'];

export const isRtlLocale = (locale: string): boolean => RTL_LANGUAGES.includes(locale.substring(0, 2));

/**
 * Marks the page with the language its text is in (`lang`) and the matching direction (`dir`).
 * Every screen sets it, not only the meeting: the lobby, the loading and the error screens
 * render before the user is in the room.
 */
export const applyDocumentLanguage = (locale: string | null | undefined): void => {
  if (!locale) return;

  const { formattedLocale } = formatLocaleCode(locale);
  const html = document.documentElement;

  html.lang = formattedLocale;
  html.setAttribute('dir', isRtlLocale(formattedLocale) ? 'rtl' : 'ltr');
};
