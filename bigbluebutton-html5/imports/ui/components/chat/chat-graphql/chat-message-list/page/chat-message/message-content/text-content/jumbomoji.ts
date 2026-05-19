// Up to this many emoji-only graphemes get the jumbomoji treatment.
// Aligned with WhatsApp/Telegram/iMessage thresholds (1-3).
export const MAX_JUMBOMOJI_COUNT = 3;

// Matches a single emoji grapheme:
//  - regional indicator pair (country flags)
//  - keycap sequences (0-9, #, *)
//  - extended_pictographic with optional VS16, optional Fitzpatrick skin-tone
//    modifier, and ZWJ chains where each segment can carry its own modifier
//    (e.g. 👨🏿‍💻 = man + dark skin + ZWJ + computer)
const EMOJI_COMPONENT = '\\p{Extended_Pictographic}\\uFE0F?\\p{Emoji_Modifier}?';
const EMOJI_GRAPHEME_SOURCE = `(?:\\p{RI}\\p{RI}|[0-9#*]\\uFE0F?\\u20E3|${EMOJI_COMPONENT}(?:\\u200D${EMOJI_COMPONENT})*)`;
const EMOJI_GRAPHEME_GLOBAL = new RegExp(EMOJI_GRAPHEME_SOURCE, 'gu');

const stripHtml = (html: string): string => {
  if (typeof document === 'undefined') {
    // SSR / non-DOM fallback: strip tags with regex. Inputs come from BBB's
    // sanitized markdown render, so tag soup isn't a concern.
    return html.replace(/<[^>]*>/g, '');
  }
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || '';
};

export const isJumbomoji = (htmlText: string, maxCount: number = MAX_JUMBOMOJI_COUNT): boolean => {
  if (!htmlText) return false;
  const condensed = stripHtml(htmlText).replace(/\s+/g, '');
  if (!condensed) return false;

  EMOJI_GRAPHEME_GLOBAL.lastIndex = 0;
  let cursor = 0;
  let count = 0;
  let match: RegExpExecArray | null = EMOJI_GRAPHEME_GLOBAL.exec(condensed);
  while (match !== null) {
    if (match.index !== cursor) return false;
    cursor += match[0].length;
    count += 1;
    if (count > maxCount) return false;
    match = EMOJI_GRAPHEME_GLOBAL.exec(condensed);
  }
  return cursor === condensed.length && count >= 1;
};
