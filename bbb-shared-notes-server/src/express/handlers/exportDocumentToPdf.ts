import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFile, readFile, unlink } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import fs, { existsSync } from 'node:fs';
import path from 'node:path';
import { Logger } from '../../common/logger';
import config from '../../config';

// Resolve to <project-root>/assets/twemoji/svg/ regardless of dev (tsx) or production
// (compiled dist/). The server is always started from the project root, so process.cwd()
// is reliable. The postinstall script (scripts/download-twemoji-assets.mjs) places files here.
const TWEMOJI_SVG_DIR = path.join(process.cwd(), 'assets/twemoji/svg');

const execAsync = promisify(exec);
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
 * Converts HTML content to PDF using pandoc
 * Uses a shell script (run-in-systemd.sh) to run the command in a sandboxed env
 * The container is ephemeral (created, used, and removed automatically)
 */
export async function exportHtmlToPdf(
  htmlContent: string,
  _options: PdfExportOptions = {}
): Promise<Buffer> {
  const { workDir, runnerScript, timeout } = config.commandExecution;

  if (!fs.existsSync(workDir)) {
    fs.mkdirSync(workDir, { recursive: true });
  }

  // Generate unique filename for isolation
  const runId = randomBytes(8).toString('hex');
  const htmlFilePath = path.join(workDir, `bbb-html-${runId}.html`);
  const pdfFilePath = path.join(workDir, `bbb-pdf-${runId}.pdf`);

  try {
    // Replace emoji Unicode characters with inline base64 SVG images so wkhtmltopdf
    // can render them (it lacks emoji font support but handles <img> elements fine).
    const htmlWithInlinedEmojis = await inlineEmojiImages(htmlContent);

    // Write HTML content to temporary file
    await writeFile(htmlFilePath, htmlWithInlinedEmojis, 'utf-8');
    // Set ownership to bigbluebutton user
    logger.info('HTML content written to temporary file', { htmlFilePath });



    // Execute bash script for conversion
    const command = `${runnerScript} ${timeout} \
      wkhtmltopdf \
          --encoding utf-8 \
          --dpi 96 \
          --page-size A4 \
          --margin-top 0mm \
          --margin-bottom 0mm \
          --margin-left 0mm \
          --margin-right 0mm \
          --print-media-type \
          --background \
          --no-header-line \
          "${htmlFilePath}" "${pdfFilePath}"`;

    logger.info('Executing conversion script', { command });

    const execTimeoutMs = (timeout * 1000) + 5000; // (script timeout + 5s buffer)
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      timeout: execTimeoutMs
    });

    if (stdout) {
      logger.debug('Script stdout', { stdout });
    }

    if (stderr) {
      logger.warn('Script stderr', { stderr });
    }

    // Check if PDF was created
    if (!existsSync(pdfFilePath)) {
      throw new Error(`PDF file not created. Script output: ${stdout || stderr}`);
    }

    // Read PDF file
    const pdfBuffer = await readFile(pdfFilePath);

    logger.info('PDF generated successfully', {
      size: pdfBuffer.length,
      runId
    });

    return pdfBuffer;

  } catch (error) {
    logger.error('Error generating PDF with Chrome', {
      error: error instanceof Error ? error.message : String(error),
      runId
    });
    throw error;
  } finally {
    // Cleanup temporary files
    try {
      if (existsSync(htmlFilePath)) {
        await unlink(htmlFilePath);
        logger.debug('Removed temporary HTML file', { htmlFilePath });
      }
      if (existsSync(pdfFilePath)) {
        await unlink(pdfFilePath);
        logger.debug('Removed temporary PDF file', { pdfFilePath });
      }
    } catch (cleanupError) {
      logger.warn('Error during cleanup', {
        error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError)
      });
    }
  }
}
