import { RequestHandler, Response } from "express";
import hocuspocus from "../hocuspocus";
import { isValidDocumentName } from "../hocuspocus/utils";
import * as Y from "yjs";
import { Logger } from "../common/logger";
import { exportDocumentToHtml } from "./handlers/exportDocumentToHtml";
import { exportDocumentToMarkdown } from "./handlers/exportDocumentToMarkdown";
import { exportHtmlToPdf } from "./handlers/exportDocumentToPdf";
import { exportDocumentToJson } from "./handlers/exportDocumentToJson";
import { exportDocumentToYjs } from "./handlers/exportDocumentToYjs";

interface DocumentApi {
  get: RequestHandler;
  export: RequestHandler;
}

const logger = new Logger('express-rest-api');

const sendExportError = (
  response: Response,
  status: number,
  message: string,
): Response => {
  return response.status(status).type('text/plain').send(
    `Export failed: ${message}. Please contact the server administrator.`
  );
};

const getExportFilename = (extension: string): string => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  return `document_${date}.${extension}`;
};

const documentApi: DocumentApi = {
  get: async (request, response) => {
    const documentName = Array.isArray(request.params.documentName)
      ? request.params.documentName[0]
      : request.params.documentName;

    if (!isValidDocumentName(documentName)) {
      return response.status(400).json({
        success: false,
        error: 'Invalid document name',
      });
    }

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
  export: async (request, response) => {
    const documentName = Array.isArray(request.params.documentName)
      ? request.params.documentName[0]
      : request.params.documentName;
    const format = Array.isArray(request.params.format)
      ? request.params.format[0]
      : request.params.format;

    if (!isValidDocumentName(documentName)) {
      return sendExportError(response, 400, 'Invalid document name');
    }

    try {
      switch (format) {
        case 'html': {
          const fullHtml = await exportDocumentToHtml(documentName);
          logger.info('HTML exported successfully', { documentName });

          // Set response headers
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.setHeader('Content-Disposition', `attachment; filename="${getExportFilename('html')}"`);

          // Send HTML
          response.send(fullHtml);
          break;
        }
        case 'pdf': {
          const fullHtmlToBeConvertedToHtml = await exportDocumentToHtml(documentName);
          const pdfBuffer = await exportHtmlToPdf(fullHtmlToBeConvertedToHtml, {
            format: 'A4',
            printBackground: true,
            margin: {
              top: '20mm',
              right: '20mm',
              bottom: '20mm',
              left: '20mm'
            }
          });

          // Set response headers
          response.setHeader('Content-Type', 'application/pdf');
          response.setHeader('Content-Disposition', `attachment; filename="${getExportFilename('pdf')}"`);
          response.setHeader('Content-Length', pdfBuffer.length);

          logger.info('PDF generated successfully', { documentName });

          // Send PDF
          response.send(pdfBuffer);
          break;
        }
        case 'txt': {
          const fullHtmlToBeConvertedToPlainText = await exportDocumentToHtml(documentName);
          // Strip HTML tags to get plain text (emojis are preserved as Unicode characters)
          const plainText = fullHtmlToBeConvertedToPlainText
            .replaceAll(/<style(?=([^>]*))\1>(?:(?!<\/style>)[\s\S])*<\/style>/gi, '') // Remove style tags and content (ReDoS-safe)
            .replaceAll(/<script(?=([^>]*))\1>(?:(?!<\/script>)[\s\S])*<\/script>/gi, '') // Remove script tags and content (ReDoS-safe)
            .replaceAll(/<title(?=([^>]*))\1>(?:(?!<\/title>)[\s\S])*<\/title>/gi, '') // Remove title tags and content (ReDoS-safe)
            .replaceAll(/<br\s*\/?>/gi, '\n') // Replace <br> with newline
            .replaceAll(/<\/?(p|div|h[1-6]|li|tr)[^>]*>/gi, '\n') // Replace block elements with newline
            .replaceAll('</ul>', '\n') // Add newline after lists
            .replaceAll('</ol>', '\n') // Add newline after ordered lists
            .replaceAll(/<(?=([^>]+))\1>/g, '') // Remove all remaining HTML tags (ReDoS-safe)
            .replaceAll('&nbsp;', ' ') // Replace &nbsp; with space
            .replaceAll('&lt;', '<') // Replace &lt; with <
            .replaceAll('&gt;', '>') // Replace &gt; with >
            .replaceAll('&amp;', '&') // Replace &amp; with &
            .replaceAll('&quot;', '"') // Replace &quot; with "
            .replaceAll('&#39;', "'") // Replace &#39; with '
            .replaceAll(/\n\s*\n\s*\n/g, '\n\n') // Collapse multiple blank lines to max 2 newlines
            .trim();

          // Set response headers
          response.setHeader('Content-Type', 'text/plain; charset=utf-8');
          response.setHeader('Content-Disposition', `attachment; filename="${getExportFilename('txt')}"`);

          logger.info('TXT exported successfully', { documentName });

          // Send plain text
          response.send(plainText);
          break;
        }
        case 'json': {
          const jsonContent = await exportDocumentToJson(documentName);

          response.setHeader('Content-Type', 'application/json; charset=utf-8');
          response.setHeader('Content-Disposition', `attachment; filename="${getExportFilename('json')}"`);

          logger.info('JSON exported successfully', { documentName });

          response.send(jsonContent);
          break;
        }
        case 'yjs': {
          const yjsContent = await exportDocumentToYjs(documentName);

          response.setHeader('Content-Type', 'text/plain; charset=utf-8');
          response.setHeader('Content-Disposition', `attachment; filename="${getExportFilename('yjs')}"`);

          logger.info('YJS exported successfully', { documentName });

          response.send(yjsContent);
          break;
        }
        case 'md': {
          const markdownContent = await exportDocumentToMarkdown(documentName);

          response.setHeader('Content-Type', 'text/plain; charset=utf-8');
          response.setHeader('Content-Disposition', `attachment; filename="${getExportFilename('md')}"`);

          logger.info('Markdown exported successfully', { documentName });

          // Send plain text
          response.send(markdownContent);
          break;
        }
        default:
          logger.error(
            `Export requested for [${documentName}] with format [${format}] not supported`
          );
          return sendExportError(response, 400, `Requested format ${format} not supported`);
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        if (error.message  === 'document_not_found') {
          return sendExportError(response, 404, 'Document not found');
        } else {
          logger.error('Error exporting document', { error: error.message, documentName });
          return sendExportError(response, 500, 'Failed to export document');
        }
      }
      logger.error('Error exporting document', { error, documentName });
      return sendExportError(response, 500, 'Failed to export document');
    }
  },
}


export { documentApi };
