import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';
import { Logger } from '../../common/logger';
import config from '../../config';

const execAsync = promisify(exec);
const logger = new Logger('exportDocumentToPdf');

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
 * Uses a bash script (convert-html-to-pdf.sh) for conversion
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
    // Write HTML content to temporary file
    await writeFile(htmlFilePath, htmlContent, 'utf-8');
    // Set ownership to bigbluebutton user
    await execAsync(`chown bigbluebutton:bigbluebutton "${htmlFilePath}"`);
    logger.info('HTML content written to temporary file', { htmlFilePath });

    // Execute bash script for conversion
    const command = `${runnerScript} ${timeout} \
      pandoc "${htmlFilePath}" \
      -o "${pdfFilePath}" \
      --pdf-engine=wkhtmltopdf \
      -V papersize=letter \
      -V margin-top=10mm \
      -V margin-bottom=10mm \
      -V margin-left=10mm \
      -V margin-right=10mm \
      --pdf-engine-opt=--dpi \
      --pdf-engine-opt=96 \
      --pdf-engine-opt=--zoom \
      --pdf-engine-opt=1.0 \
      --pdf-engine-opt=--print-media-type \
      --pdf-engine-opt=--no-header-line \
      -M title=`;

    logger.info('Executing conversion script', { command });

    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      timeout: 35000 // 35 seconds (script timeout + 5s buffer)
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
    const { readFile } = await import('fs/promises');
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
