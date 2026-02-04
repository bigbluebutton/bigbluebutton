import { RequestHandler } from "express";
import hocuspocus from "../hocuspocus";
import * as Y from "yjs";
import { Logger } from "../common/logger";
import { ServerBlockNoteEditor } from "@blocknote/server-util";
import { validateInitialContentJson } from "./utils";
import puppeteer, { Browser } from "puppeteer";
import { exportDocumentToHtml } from "./handlers/exportDocumentToHtml";

interface DocumentApi {
  get: RequestHandler;
  post: RequestHandler;
  export: RequestHandler;
}

const logger = new Logger('express-rest-api');

// Singleton browser instance for PDF generation (reused across requests)
let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    logger.info('Launching new browser instance');
    browserInstance = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return browserInstance;
}

const documentApi: DocumentApi = {
  get: async (request, response) => {
    const documentName = Array.isArray(request.params.documentName)
      ? request.params.documentName[0]
      : request.params.documentName;

    try {
      const connection = await hocuspocus.openDirectConnection(documentName);
      const doc = connection.document;

      if (!doc) {
        await connection.disconnect();
        return response.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      const fragment = doc.getXmlFragment("doc");

      // Extract text content recursively from XML elements
      const extractText = (element: Y.XmlElement | Y.XmlFragment): string => {
        let text = '';
        for (let i = 0; i < element.length; i++) {
          const child = element.get(i);
          if (child instanceof Y.XmlText) {
            text += child.toString();
          } else if (child instanceof Y.XmlElement) {
            text += extractText(child);
          }
        }
        return text;
      };

      const content = extractText(fragment);

      await connection.disconnect();

      logger.info('Document retrieved successfully', { documentName });
      response.status(200).json({
        success: true,
        documentName,
        content,
        isEmpty: fragment.length === 0
      });
    } catch (error) {
      logger.error('Error retrieving document', { error, documentName });
      response.status(500).json({
        success: false,
        error: 'Failed to retrieve document',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },
  post: async (request, response) => {
    const documentName = Array.isArray(request.params.documentName)
      ? request.params.documentName[0]
      : request.params.documentName;

    const validationResult = validateInitialContentJson(request.body);
    if (validationResult.valid) {
      const { blocks: initialBlocks } = request.body;
      try {
        const connection = await hocuspocus.openDirectConnection(documentName);

        const doc = connection.document;

        if (!doc) {
          await connection.disconnect();
          return response.status(500).json({
            success: false,
            error: 'Failed to initialize document'
          });
        }

        const fragment = doc.getXmlFragment("doc");

        // Check if document already has content
        if (fragment.length > 0) {
          await connection.disconnect();
          return response.status(409).send("Document already exists");
        }

        // Create a ServerBlockNoteEditor instance
        const editor = ServerBlockNoteEditor.create();

        // Convert blocks to Yjs XML Fragment directly in our document's fragment
        editor.blocksToYXmlFragment(initialBlocks, fragment);

        await connection.disconnect();

        logger.info('Document created/loaded successfully', { documentName });
        response.status(204).send();
      } catch (error) {
        logger.error('Error creating document', { error, documentName });
        response.status(500).json({
          success: false,
          error: 'Failed to create document',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  },
  export: async (request, response) => {
    const documentName = Array.isArray(request.params.documentName)
      ? request.params.documentName[0]
      : request.params.documentName;
    const format = Array.isArray(request.params.format)
      ? request.params.format[0]
      : request.params.format;
    try {
      const fullHtml = await exportDocumentToHtml(documentName);

      switch (format) {
        case 'html':
          logger.info('HTML exported successfully', { documentName });

          // Set response headers
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.setHeader('Content-Disposition', `attachment; filename="${documentName}.html"`);

          // Send HTML
          response.send(fullHtml);
          break;
        case 'pdf':
          // Puppeteer implementation with browser reuse (optimal solution)
          const browser = await getBrowser();
          const page = await browser.newPage();

          try {
            await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

            // Generate PDF buffer
            const pdfBuffer = await page.pdf({
              format: 'A4',
              printBackground: true,
              margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
              }
            });

            logger.info('PDF generated successfully', { documentName });

            // Set response headers
            response.setHeader('Content-Type', 'application/pdf');
            response.setHeader('Content-Disposition', `attachment; filename="${documentName}.pdf"`);
            response.setHeader('Content-Length', pdfBuffer.length);

            // Send PDF
            response.send(pdfBuffer);
          } finally {
            // Close the page, but keep the browser running for reuse
            await page.close();
          }
          break;
        case 'txt':
          // Strip HTML tags to get plain text (emojis are preserved as Unicode characters)
          const plainText = fullHtml
            .replace(/<style[^>]*>.*?<\/style>/gis, '') // Remove style tags and content
            .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove script tags and content
            .replace(/<br\s*\/?>/gi, '\n') // Replace <br> with newline
            .replace(/<\/?(p|div|h[1-6]|li|tr)[^>]*>/gi, '\n') // Replace block elements with newline
            .replace(/<\/ul>/gi, '\n') // Add newline after lists
            .replace(/<\/ol>/gi, '\n') // Add newline after ordered lists
            .replace(/<[^>]+>/g, '') // Remove all remaining HTML tags
            .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
            .replace(/&lt;/g, '<') // Replace &lt; with <
            .replace(/&gt;/g, '>') // Replace &gt; with >
            .replace(/&amp;/g, '&') // Replace &amp; with &
            .replace(/&quot;/g, '"') // Replace &quot; with "
            .replace(/&#39;/g, "'") // Replace &#39; with '
            .replace(/\n\s*\n\s*\n/g, '\n\n') // Collapse multiple blank lines to max 2 newlines
            .trim();

          logger.info('TXT exported successfully', { documentName });

          // Set response headers
          response.setHeader('Content-Type', 'text/plain; charset=utf-8');
          response.setHeader('Content-Disposition', `attachment; filename="${documentName}.txt"`);

          // Send plain text
          response.send(plainText);
          break;
        default:
          logger.error(
            `Export requested for [${documentName}] with format [${format}] not supported`
          );
          return response.status(400).json({
            success: false,
            error: `Requested format ${format} not supported`,
          });
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        if (error.message  === 'document_not_found'){
          return response.status(404).json({
            success: false,
            error: 'Document not found'
          });
        }
        else if (error.message  === 'document_empty') {
          return response.status(404).json({
            success: false,
            error: 'Document is empty'
          });
        }
      }
      logger.error('Error generating PDF', { error, documentName });
      response.status(500).json({
        success: false,
        error: 'Failed to generate PDF',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },
}


export { documentApi };