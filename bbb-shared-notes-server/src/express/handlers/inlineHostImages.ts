import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Logger } from '../../common/logger';
import config from '../../config';

const logger = new Logger('inlineHostImages');

// Same-origin uploads served by bbb-file-upload. The pattern mirrors the nginx
// serving location exactly (meetingId + uuid.ext), so only files that the upload
// service could have produced are ever read from disk. An optional query string
// is tolerated but ignored.
const UPLOAD_SRC_PATTERN = new RegExp(
  '^/bigbluebutton/fileUpload/([A-Za-z0-9-]+)/([a-f0-9-]+\\.(png|jpe?g|gif|webp))(?:\\?.*)?$',
);

const MIME_BY_EXT: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
};

const extractSrc = (imgTag: string): string | null => {
  const match = /\ssrc\s*=\s*"([^"]*)"/.exec(imgTag);
  return match ? match[1] : null;
};

// BlockNote mirrors the image URL into a `data-url` attribute (editor metadata)
// alongside `src`. That attribute is meaningless in a static export and would
// otherwise leak the original relative upload path even after `src` is inlined,
// so it is removed from every <img> tag we keep.
const stripDataUrlAttr = (imgTag: string): string =>
  imgTag.replace(/\s+data-url\s*=\s*"[^"]*"/gi, '');

// Reads an uploaded image from disk and returns a base64 data URI, or null when
// the src is not a valid same-origin upload or the file is missing on disk.
const toDataUri = async (src: string): Promise<string | null> => {
  const match = UPLOAD_SRC_PATTERN.exec(src);
  if (!match) return null;

  const [, meetingId, filename] = match;
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const mime = MIME_BY_EXT[ext];
  if (!mime) return null;

  const filePath = path.join(
    config.fileUpload.basePath,
    meetingId,
    config.fileUpload.uploadsDirName,
    filename,
  );

  try {
    const buffer = await readFile(filePath);
    return `data:${mime};base64,${buffer.toString('base64')}`;
  } catch {
    logger.warn('Uploaded image not found on disk; dropping it from export', { filePath });
    return null;
  }
};

/**
 * Rewrites <img> tags in exported HTML so the document is self-contained and
 * safe. Images served from /bigbluebutton/fileUpload/ are read from disk and
 * embedded as base64 data URIs (the sandboxed wkhtmltopdf PDF process runs with
 * PrivateNetwork and cannot fetch them over HTTP). Any other <img> - external
 * URLs above all - is stripped, enforcing the same-origin policy on export and
 * preventing tracking pixels or IP leaks in the exported artifact.
 *
 * Runs before emoji inlining (exportDocumentToPdf), so the only <img> tags
 * present here come from BlockNote image blocks, never from emoji.
 */
export async function inlineHostImages(html: string): Promise<string> {
  const imgTags = html.match(/<img\b[^>]*>/gi);
  if (!imgTags) return html;

  const replacements = new Map<string, string>();
  await Promise.all(imgTags.map(async (tag) => {
    if (replacements.has(tag)) return;
    const src = extractSrc(tag);
    // Already-inlined data URIs are same-origin content, leave them untouched
    // (but still drop the redundant data-url metadata).
    if (src && src.startsWith('data:')) {
      replacements.set(tag, stripDataUrlAttr(tag));
      return;
    }
    const dataUri = src ? await toDataUri(src) : null;
    if (dataUri) {
      const inlined = stripDataUrlAttr(tag).replace(/(\ssrc\s*=\s*")[^"]*(")/, `$1${dataUri}$2`);
      replacements.set(tag, inlined);
    } else {
      // Not a valid same-origin upload (or missing on disk): drop the tag.
      replacements.set(tag, '');
    }
  }));

  return html.replace(/<img\b[^>]*>/gi, (tag) => replacements.get(tag) ?? '');
}
