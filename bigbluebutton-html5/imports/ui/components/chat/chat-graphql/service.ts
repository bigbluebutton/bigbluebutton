const lineBreakingTags = new Set(['P', 'DIV', 'PRE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'TABLE', 'TR', 'TD']);

// Truncates the subtree at the first visual line break: a newline inside a
// text node (rendered as a break by `white-space: pre-wrap`), a <br>, or the
// end of the first nested line-breaking element. Returns true when the line
// ended inside the given node, so callers must drop the siblings that follow.
const truncateAtFirstLineBreak = (node: Node): boolean => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || '';
    // whitespace-only nodes are markup formatting between elements, not a visual break
    if (!text.trim()) return false;
    const newlineIndex = text.indexOf('\n');
    if (newlineIndex === -1) return false;
    // eslint-disable-next-line no-param-reassign
    node.textContent = text.slice(0, newlineIndex);
    return true;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return false;

  const element = node as Element;
  if (element.tagName === 'BR') {
    element.remove();
    return true;
  }

  let lineEnded = false;
  Array.from(element.childNodes).forEach((child) => {
    if (lineEnded) {
      child.remove();
      return;
    }
    lineEnded = truncateAtFirstLineBreak(child)
      || (child.nodeType === Node.ELEMENT_NODE && lineBreakingTags.has((child as Element).tagName));
  });

  return lineEnded;
};

export const getFirstVisibleLineHtml = (htmlContent: string): string => {
  if (!htmlContent.trim()) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const root = doc.body.firstElementChild;
  if (!root) return '';

  truncateAtFirstLineBreak(root);

  return root.outerHTML;
};

/** A mention completed from the picker: the user id is what the server anchors it on. */
export type PickedMention = { userId: string; name: string; atIndex: number };

/** The word boundaries the server matches on, kept in step with MarkdownUtil.scala. */
const MENTION_LEFT_BOUNDARY_CHARS = new Set(['(', '[', '>', '"', "'"]);
const MENTION_RIGHT_BOUNDARY_CHARS = new Set([',', '.', '!', '?', ';', ':', ')', ']', '>', '<', '"', "'"]);

export const isMentionLeftBoundary = (char: string | undefined): boolean => (
  char === undefined || /\s/.test(char) || MENTION_LEFT_BOUNDARY_CHARS.has(char)
);

const isMentionRightBoundary = (char: string | undefined): boolean => (
  char === undefined || /\s/.test(char) || MENTION_RIGHT_BOUNDARY_CHARS.has(char)
);

/**
 * Every "@name" in the text that stands on its own as a word, in reading order. Matched without
 * case, like the server does, so recasing a name doesn't unpin the mention from it.
 *
 * Both ends are checked: without the right one, "@Karen" would keep matching after the text was
 * edited to read "@Karenina", and the mention would still point at Karen.
 */
const mentionOccurrences = (text: string, name: string): number[] => {
  const target = name.toLowerCase();
  const found: number[] = [];

  for (let at = text.indexOf('@'); at !== -1; at = text.indexOf('@', at + 1)) {
    const nameEnd = at + 1 + name.length;
    if (isMentionLeftBoundary(text[at - 1])
      && text.slice(at + 1, nameEnd).toLowerCase() === target
      && isMentionRightBoundary(text[nameEnd])) {
      found.push(at);
    }
  }

  return found;
};

/**
 * Re-anchors the dismissed prompts after an edit. A textarea change is one contiguous splice,
 * so what sits before it keeps its index and what sits after it moves by the length change:
 * without that, typing ahead of a dismissed "@" would reopen the picker on it.
 */
export const remapDismissedIndexes = (
  previous: string,
  next: string,
  indexes: Set<number>,
): Set<number> => {
  if (indexes.size === 0) return indexes;

  let prefix = 0;
  while (prefix < previous.length && prefix < next.length && previous[prefix] === next[prefix]) {
    prefix += 1;
  }

  const shift = next.length - previous.length;
  const remapped = new Set<number>();

  indexes.forEach((index) => {
    const moved = index < prefix ? index : index + shift;
    // An index that no longer sits on an "@" was edited away, and its dismissal with it.
    if (moved >= 0 && next[moved] === '@') remapped.add(moved);
  });

  return remapped;
};

/**
 * Keeps the picked mentions pinned to the text while it is edited: each one takes the free
 * "@name" occurrence closest to where it was, and is dropped once its name is gone.
 */
export const syncPickedMentions = (text: string, picked: PickedMention[]): PickedMention[] => {
  const claimed = new Set<number>();

  return [...picked]
    .sort((a, b) => a.atIndex - b.atIndex)
    .reduce<PickedMention[]>((acc, mention) => {
      const free = mentionOccurrences(text, mention.name).filter((at) => !claimed.has(at));
      if (free.length === 0) return acc;
      const closest = free.reduce((best, at) => (
        Math.abs(at - mention.atIndex) < Math.abs(best - mention.atIndex) ? at : best
      ), free[0]);
      claimed.add(closest);
      return [...acc, { ...mention, atIndex: closest }];
    }, []);
};

/**
 * Recovers the mentions of a message being edited from the spans the server wrote, so editing
 * doesn't downgrade them back to a name match.
 */
export const pickedMentionsFromHtml = (text: string, html: string): PickedMention[] => {
  if (!html) return [];

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const claimed = new Set<number>();

  return Array.from(doc.querySelectorAll('span.chat-mention[data-userid]')).flatMap((span) => {
    const userId = span.getAttribute('data-userid') ?? '';
    const name = (span.textContent ?? '').replace(/^@/, '');
    if (!userId || !name) return [];
    const at = mentionOccurrences(text, name).find((index) => !claimed.has(index));
    if (at === undefined) return [];
    claimed.add(at);
    return [{ userId, name, atIndex: at }];
  });
};

/** A middleware older than the encoding fix streams the metadata already decoded. */
export const parseMessageMetadata = (metadata: unknown): Record<string, unknown> | null => {
  if (metadata === null || metadata === undefined) return null;
  if (typeof metadata === 'object') return metadata as Record<string, unknown>;
  if (typeof metadata !== 'string') return null;

  try {
    const parsed = JSON.parse(metadata);
    return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
};

export default {
  getFirstVisibleLineHtml,
  isMentionLeftBoundary,
  parseMessageMetadata,
  pickedMentionsFromHtml,
  remapDismissedIndexes,
  syncPickedMentions,
};
