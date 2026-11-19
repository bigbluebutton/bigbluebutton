export const SUPPORTED_LOCALES = new Set([
  'af', 'ar', 'az', 'bg_BG', 'bn', 'ca', 'cs_CZ', 'da', 'de', 'dv', 'el_GR', 'en', 'eo', 'es',
  'es_419', 'es_ES', 'es_MX', 'et', 'eu', 'fa_IR', 'fi', 'fr', 'gl', 'he', 'hi_IN', 'hr', 'hu_HU',
  'hy', 'id', 'it_IT', 'ja', 'ka', 'km', 'kn', 'ko_KR', 'lo_LA', 'lt_LT', 'lv', 'ml', 'mn_MN',
  'nb_NO', 'nl', 'oc', 'pl_PL', 'pt', 'pt_BR', 'ro_RO', 'ru', 'sk_SK', 'sl', 'sq_AL', 'sr', 'sv_SE',
  'ta', 'te', 'th', 'tr', 'tr_TR', 'uk_UA', 'vi', 'vi_VN', 'zh_CN', 'zh_TW',
]);

export function normalizeLocale(lang) {
  if (typeof lang !== 'string') return '';
  const parts = lang.split('-');
  return parts.length > 1 ? `${parts[0]}_${parts[1].toUpperCase()}` : lang;
}

export function resolveLocale(lang) {
  const normalizedLocale = normalizeLocale(lang);
  return SUPPORTED_LOCALES.has(normalizedLocale) ? normalizedLocale : 'en';
}
