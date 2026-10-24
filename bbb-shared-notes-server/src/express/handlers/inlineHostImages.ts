import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { Logger } from '../../common/logger';
import config from '../../config';

const logger = new Logger('inlineHostImages');

// Same-origin uploads served by bbb-file-upload. The pattern mirrors the nginx
// serving location exactly (meetingId + uuid.ext), so only files that the upload
// service could have produced are ever read from disk. An optional query string
// is tolerated but ignored.
const UPLOAD_SRC_PATTERN = /^\/bigbluebutton\/fileUpload\/([A-Za-z0-9-]+)\/([a-f0-9-]+\.(png|jpe?g|gif|webp))(?:\?.*)?$/;

const MIME_BY_EXT: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
};

// Reads an uploaded image from disk and returns a base64 data URI, or null when
// the src is not a valid same-origin upload, references a different meeting than
// the one being exported, or the file is missing on disk.
const toDataUri = async (src: string, expectedMeetingId: string): Promise<string | null> => {
  const match = UPLOAD_SRC_PATTERN.exec(src);
  if (!match) return null;

  const [, meetingId, filename] = match;

  // Cross-meeting guard (IDOR): the meetingId in the <img src> comes straight
  // from the pad document, which any editor can set. Only read uploads that
  // belong to the meeting whose document is actually being exported; otherwise
  // drop the tag exactly like an external URL.
  if (meetingId !== expectedMeetingId) {
    logger.warn('Image src references a different meeting than the export; dropping it', {
      srcMeetingId: meetingId,
      expectedMeetingId,
    });
    return null;
  }

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
 *
 * `expectedMeetingId` is the meeting the exported document belongs to; only
 * uploads for that meeting are inlined, so a pad editor cannot embed another
 * meeting's upload path and exfiltrate its images (cross-meeting file read).
 */
export async function inlineHostImages(html: string, expectedMeetingId: string): Promise<string> {
  // Parse the HTML into a DOM and rewrite <img> nodes, never with a regex.
  // HTML attribute values legitimately contain '<', '>' and (as `&quot;`) '"',
  // and the HTML serialization spec leaves '<'/'>' raw inside a quoted value.
  // A regex over the raw string cannot tell an attribute boundary from a tag
  // boundary, so it can stop at a '>' that lives inside an `alt`/`data-caption`
  // value, truncate the tag, and leave the trailing markup live in the output.
  // Parsing sidesteps that entire class of bug: the DOM knows exactly where each
  // <img> begins and ends regardless of what its attributes contain.
  const isFullDocument = /^\s*<(?:!doctype|html)\b/i.test(html);
  const dom = new JSDOM(html);
  const { document } = dom.window;

  // Minimal structural types for the DOM operations used below. The tsconfig
  // intentionally omits the `dom` lib (this is a node service), so the global
  // Element/HTMLImageElement types are not in scope and the NodeList elements
  // would otherwise be `unknown`.
  type ImgNode = {
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string): void;
    remove(): void;
  };
  type WithAttr = { removeAttribute(name: string): void };

  const imgs = Array.from(document.querySelectorAll('img')) as unknown as ImgNode[];
  await Promise.all(imgs.map(async (img) => {
    const src = img.getAttribute('src');
    // Already-inlined data URIs are same-origin content, leave them untouched.
    if (src && src.startsWith('data:')) return;
    const dataUri = src ? await toDataUri(src, expectedMeetingId) : null;
    if (dataUri) {
      img.setAttribute('src', dataUri);
    } else {
      // Not a valid same-origin upload (or missing on disk): drop the tag.
      img.remove();
    }
  }));

  // BlockNote mirrors the image URL into a `data-url` attribute (editor metadata)
  // on the image wrapper it emits (<figure>/<div>/<a>) as well as on the <img>.
  // It is meaningless in a static export and would otherwise leak the original
  // relative upload path even after `src` is inlined, so it is dropped from every
  // element that still carries it. (The regex version only ever looked at <img>,
  // so the wrapper's copy of the path always survived - this closes that leak.)
  const withDataUrl = Array.from(document.querySelectorAll('[data-url]')) as unknown as WithAttr[];
  withDataUrl.forEach((el) => el.removeAttribute('data-url'));

  // Serialize back in the same shape we received: dom.serialize() for a full
  // document (production passes `<!DOCTYPE html>...`), body.innerHTML for a bare
  // fragment (so a fragment in never grows an <html>/<body> wrapper out).
  return isFullDocument ? dom.serialize() : document.body.innerHTML;
}
