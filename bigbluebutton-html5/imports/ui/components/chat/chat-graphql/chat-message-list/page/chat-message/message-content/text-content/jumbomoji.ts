// Up to this many emoji-only graphemes get the jumbomoji treatment.
// Aligned with WhatsApp/Telegram/iMessage thresholds (1-3).
export const MAX_JUMBOMOJI_COUNT = 3;

// Matches a single emoji grapheme:
//  - regional indicator pair (country flags)
//  - keycap sequences (0-9, #, *)
//  - extended_pictographic with optional VS16, optional Fitzpatrick skin-tone
//    modifier, and ZWJ chains where each segment can carry its own modifier
//    (e.g. 👨🏿‍💻 = man + dark skin + ZWJ + computer)
// Unicode property escapes with the 'u' flag are ES2018, the compile target of
// this codebase. \p{RGI_Emoji} would be stricter, but it requires the 'v' flag
// (ES2024), beyond the current TS target and browser floor.
const EMOJI_COMPONENT = '\\p{Extended_Pictographic}\\uFE0F?\\p{Emoji_Modifier}?';
const EMOJI_GRAPHEME = `(?:\\p{RI}\\p{RI}|[0-9#*]\\uFE0F?\\u20E3|${EMOJI_COMPONENT}(?:\\u200D${EMOJI_COMPONENT})*)`;

// The whole string must consist of 1..MAX_JUMBOMOJI_COUNT emoji graphemes and
// nothing else.
const JUMBOMOJI_PATTERN = new RegExp(
  `^${EMOJI_GRAPHEME}{1,${MAX_JUMBOMOJI_COUNT}}$`,
  'u',
);

// Message text arrives as sanitized HTML (server-side commonmark render).
// Parsing it into a detached element both strips tags and decodes entities.
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || '';
};

export const isJumbomoji = (htmlText: string): boolean => {
  if (!htmlText) return false;
  const condensed = stripHtml(htmlText).replace(/\s+/g, '');
  return JUMBOMOJI_PATTERN.test(condensed);
};
