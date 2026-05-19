// Up to this many emoji-only graphemes get the jumbomoji treatment.
// Aligned with WhatsApp/Telegram/iMessage thresholds (1-3).
export const MAX_JUMBOMOJI_COUNT = 3;

// Matches a single emoji grapheme:
//  - regional indicator pair (country flags)
//  - keycap sequences (0-9, #, *)
//  - extended_pictographic with optional VS16 and ZWJ chains
const EMOJI_GRAPHEME_SOURCE = '(?:\\p{RI}\\p{RI}|[0-9#*]\\uFE0F?\\u20E3|\\p{Extended_Pictographic}\\uFE0F?(?:\\u200D\\p{Extended_Pictographic}\\uFE0F?)*)';
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
