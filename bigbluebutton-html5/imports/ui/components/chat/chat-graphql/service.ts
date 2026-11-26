import { IntlShape } from 'react-intl';
import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';

// Uploaded images are served behind an auth_request that reads the sessionToken
// from the query string (same as presentation slides). The markdown stores the
// bare relative path, so we append the token at render time, mirroring
// Auth.authenticateURL used for slides. The regex only touches our own
// fileUpload paths; every other message is left untouched.
const FILE_UPLOAD_IMG_SRC = /(<img\b[^>]*?\bsrc=")(\/bigbluebutton\/fileUpload\/[^"]+)(")/g;

export const authenticateUploadedImages = (html: string): string => html.replace(
  FILE_UPLOAD_IMG_SRC,
  (_match, prefix, url, suffix) => `${prefix}${Auth.authenticateURL(url)}${suffix}`,
);

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

  // Collect any <img> elements from the full content before truncating, so
  // that a message with text + image still shows the image in the reply
  // preview (the truncation drops everything after the first line, which
  // would lose the image when it follows the text paragraph).
  const images = Array.from(doc.body.querySelectorAll('img')).map((img) => img.cloneNode(true) as Element);

  truncateAtFirstLineBreak(root);

  // Re-append collected images that are no longer in the truncated root.
  // CSS.escape keeps a src containing quotes or backslashes from breaking out
  // of the attribute selector (a malformed selector throws in querySelector).
  images.forEach((img) => {
    if (!root.querySelector(`img[src="${CSS.escape(img.getAttribute('src') || '')}"]`)) {
      root.appendChild(img);
    }
  });

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

/** The file a message carries, as the server keeps it in metadata.attachment. */
export interface ChatAttachment {
  url: string;
  name: string;
  size: number;
  mime: string;
}

const FILE_UPLOAD_PATH = /^\/bigbluebutton\/fileUpload\//;

/**
 * The attachment of a message, or null when it has none. The server already
 * drops an attachment that is not a valid upload of the meeting; this only
 * guards the shape, so a message from an older server still renders as text.
 */
export const parseAttachment = (metadata: unknown): ChatAttachment | null => {
  const parsed = parseMessageMetadata(metadata);
  const attachment = parsed?.attachment as Partial<ChatAttachment> | undefined;
  if (!attachment || typeof attachment !== 'object') return null;
  const {
    url, name, size, mime,
  } = attachment;
  if (typeof url !== 'string' || !FILE_UPLOAD_PATH.test(url)) return null;
  if (typeof name !== 'string' || typeof mime !== 'string') return null;
  if (typeof size !== 'number' || !Number.isFinite(size) || size < 0) return null;
  return {
    url, name, size, mime,
  };
};

export const isImageAttachment = (attachment: ChatAttachment): boolean => attachment.mime.startsWith('image/');

/**
 * The message html without the image or link that stands for its attachment.
 * The body carries them so the message still reads right where the attachment
 * is not drawn (an older client, the recording); where it is drawn, they would
 * show the file twice. A paragraph left empty goes too.
 */
export const removeAttachmentFromHtml = (html: string, attachment: ChatAttachment): string => {
  if (!html.trim()) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.body.querySelectorAll('img[src], a[href]').forEach((el) => {
    const ref = el.getAttribute(el.tagName === 'IMG' ? 'src' : 'href');
    if (ref === attachment.url) el.remove();
  });
  doc.body.querySelectorAll('p').forEach((p) => {
    if (!p.textContent?.trim() && !p.querySelector('img')) p.remove();
  });
  return doc.body.innerHTML.trim();
};

const BYTES_PER_KB = 1024;
const BYTES_PER_MB = 1024 * 1024;

// The short name users know each allowed type by; any other type falls back
// to its mime subtype.
const FILE_TYPE_LABELS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'video/mp4': 'mp4',
  'audio/mpeg': 'mp3',
};

export const fileTypeLabel = (mime: string): string => FILE_TYPE_LABELS[mime] ?? mime.split('/').pop() ?? mime;

export const formatFileSize = (intl: IntlShape, bytes: number): string => {
  if (bytes >= BYTES_PER_MB) {
    return intl.formatNumber(bytes / BYTES_PER_MB, { style: 'unit', unit: 'megabyte', maximumFractionDigits: 1 });
  }
  return intl.formatNumber(Math.max(1, Math.ceil(bytes / BYTES_PER_KB)), { style: 'unit', unit: 'kilobyte' });
};

/**
 * Saves the attachment under its original name. The upload is served under a
 * random name, so a plain link would save it as <uuid>.<ext>; fetching it and
 * saving the blob keeps the name the sender chose.
 */
export const downloadAttachment = async (attachment: ChatAttachment): Promise<void> => {
  try {
    const response = await fetch(Auth.authenticateURL(attachment.url));
    if (!response.ok) throw new Error(`status ${response.status}`);
    const objectUrl = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Safari reads the blob after the click returns, so revoking right away can
    // cancel the download; a minute later it has long been taken.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  } catch (error) {
    logger.error({
      logCode: 'chat_attachment_download_error',
      extraInfo: { url: attachment.url, mime: attachment.mime },
    }, `Chat attachment download failed: ${(error as Error)?.message}`);
  }
};

export default {
  authenticateUploadedImages,
  downloadAttachment,
  fileTypeLabel,
  formatFileSize,
  getFirstVisibleLineHtml,
  isImageAttachment,
  isMentionLeftBoundary,
  parseAttachment,
  parseMessageMetadata,
  pickedMentionsFromHtml,
  remapDismissedIndexes,
  removeAttachmentFromHtml,
  syncPickedMentions,
};
