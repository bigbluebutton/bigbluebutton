import net from 'node:net';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Logger } from '../../common/logger';
import config from '../../config';
import { renderMathForPdf } from '../../common/math';

// Resolve to <project-root>/assets/twemoji/svg/ regardless of dev (tsx) or production
// (compiled dist/). The server is always started from the project root, so process.cwd()
// is reliable. The postinstall script (scripts/download-twemoji-assets.mjs) places files here.
const TWEMOJI_SVG_DIR = path.join(process.cwd(), 'assets/twemoji/svg');

const PDF_MAGIC = Buffer.from('%PDF-');
const PDF_EOF = Buffer.from('%%EOF');
const logger = new Logger('exportDocumentToPdf');

/**
 * Replaces emoji Unicode characters in HTML with inline base64-encoded SVG <img> tags.
 * wkhtmltopdf cannot render emoji glyphs from fonts, but it can render <img> elements.
 *
 * SVG files are read from the local assets/twemoji/svg/ directory that was populated
 * by the postinstall script (scripts/download-twemoji-assets.mjs). No network requests
 * are made at runtime — this works fully offline.
 */
async function inlineEmojiImages(html: string): Promise<string> {
  // Dynamic import handles CJS/ESM interop for the twemoji package
  const twemojiModule = await import('twemoji');
  const twemoji = (twemojiModule.default ?? twemojiModule) as { parse: (html: string, options?: Record<string, unknown>) => string };

  // Replace emoji Unicode characters with <img class="emoji"> tags.
  // The base URL is a placeholder — we only use it to extract the filename (codepoint).
  const parsedHtml: string = twemoji.parse(html, {
    base: 'https://twemoji.local/',
    folder: 'svg',
    ext: '.svg',
  });

  // Collect unique filenames (e.g. "1f600.svg") from generated emoji <img> tags
  const filenames = new Set<string>();
  const allImgTags = parsedHtml.match(/<img[^>]+>/g) ?? [];
  for (const tag of allImgTags) {
    if (tag.includes('class="emoji"')) {
      const srcMatch = /src="[^"]+\/([^"/]+\.svg)"/.exec(tag);
      if (srcMatch) filenames.add(srcMatch[1]);
    }
  }

  if (filenames.size === 0) return html; // No emojis found — return original unchanged

  // Read each SVG file from disk and encode as a base64 data URI
  const base64Cache = new Map<string, string>(); // filename → data URI
  await Promise.all([...filenames].map(async (filename) => {
    const filePath = path.join(TWEMOJI_SVG_DIR, filename);
    try {
      const svgBuffer = await readFile(filePath);
      const base64 = svgBuffer.toString('base64');
      base64Cache.set(filename, `data:image/svg+xml;base64,${base64}`);
    } catch {
      logger.warn('Twemoji SVG not found on disk; emoji may not render in PDF', { filePath });
    }
  }));

  // Inject emoji sizing CSS so images align with surrounding text
  const emojiCss = '<style>.emoji { height: 1em; width: 1em; margin: 0 0.05em 0 0.1em; vertical-align: -0.15em; display: inline-block; }</style>';
  let result = parsedHtml.replace('</head>', `${emojiCss}\n</head>`);

  // Swap placeholder emoji <img> tags for base64 data URIs, or plain alt text when
  // the SVG is missing — avoids leaving unreachable https://twemoji.local/... URLs
  // in the HTML that the sandboxed wkhtmltopdf process can never fetch.
  result = result.replaceAll(/<img[^>]+class="emoji"[^>]*>/g, (imgTag) => {
    const srcMatch = /src="[^"]+\/([^"/]+\.svg)"/.exec(imgTag);
    if (!srcMatch) return imgTag;
    const b64 = base64Cache.get(srcMatch[1]);
    if (b64) return imgTag.replace(/src="[^"]+"/, `src="${b64}"`);
    // SVG not on disk — fall back to the raw emoji character (alt text)
    const altMatch = /alt="([^"]*)"/.exec(imgTag);
    return altMatch?.[1] ?? '';
  });

  return result;
}

interface PdfExportOptions {
  format?: 'A4' | 'Letter';
  printBackground?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

/**
 * Converts HTML content to PDF with wkhtmltopdf.
 * The HTML is sent to the bbb-shared-notes-conversion socket, where each connection starts a
 * sandboxed bbb-shared-notes-conversion@ service that writes the PDF back and closes it.
 */
export async function exportHtmlToPdf(
  htmlContent: string,
  _options: PdfExportOptions = {}
): Promise<Buffer> {
  const { conversionSocket, timeout } = config.commandExecution;

  try {
    // Replace emoji Unicode characters with inline base64 SVG images so wkhtmltopdf
    // can render them (it lacks emoji font support but handles <img> elements fine).
    const htmlWithInlinedEmojis = await inlineEmojiImages(htmlContent);
    // wkhtmltopdf does not render MathML either: typeset math with KaTeX.
    const htmlForPdf = await renderMathForPdf(htmlWithInlinedEmojis);

    const pdfBuffer = await convertThroughSocket(conversionSocket, htmlForPdf, (timeout * 1000) + 5000);
    logger.info('PDF generated successfully', { size: pdfBuffer.length });
    return pdfBuffer;
  } catch (error) {
    logger.error('Error generating PDF', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

function convertThroughSocket(socketPath: string, html: string, timeoutMs: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const socket = net.createConnection(socketPath);

    socket.setTimeout(timeoutMs, () => {
      socket.destroy(new Error(`PDF conversion timed out after ${timeoutMs}ms`));
    });
    socket.on('connect', () => socket.end(html, 'utf-8'));
    socket.on('data', (chunk: Buffer) => chunks.push(chunk));
    socket.on('error', reject);
    socket.on('close', (hadError) => {
      if (hadError) return;
      const pdf = Buffer.concat(chunks);
      // The service sends nothing back when the conversion fails or hits its time limit
      if (!pdf.subarray(0, PDF_MAGIC.length).equals(PDF_MAGIC)) {
        reject(new Error(`PDF conversion returned no PDF (${pdf.length} bytes)`));
        return;
      }
      if (!pdf.subarray(-1024).includes(PDF_EOF)) {
        reject(new Error(`PDF conversion returned a truncated PDF (${pdf.length} bytes)`));
        return;
      }
      resolve(pdf);
    });
  });
}
