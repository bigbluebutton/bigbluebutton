import { ServerBlockNoteEditor } from "@blocknote/server-util";
import hocuspocus from "../../hocuspocus";
import { Logger } from "../../common/logger";

const logger = new Logger('redis.service.pushInitialContent');

interface InitialContent {
  // BlockNote blocks already parsed on the web tier (sharedNotesInitialContentJson).
  initialContentJson?: any;
  // Raw markdown carried untouched from the create API (sharedNotesInitialContentMarkdown);
  // BlockNote only exists here, so the markdown -> blocks conversion happens on this tier.
  initialContentMarkdown?: string;
}

export async function pushInitialContent(padId: string, content: InitialContent): Promise<{ statusCode: string; error?: string; }> {
  const documentName = padId;

  let connection: Awaited<ReturnType<typeof hocuspocus.openDirectConnection>> | null = null;
  try {
    connection = await hocuspocus.openDirectConnection(documentName);

    const doc = connection.document;

    if (!doc) {
      return {
        statusCode: 'document_unavailable',
        error: 'Document not found',
      };
    }

    const fragment = doc.getXmlFragment("doc");

    // Check if document already has content
    if (fragment.length > 0) {
      return {
        statusCode: 'document_already_filled',
        error: 'Document already exists and has content',
      };
    }

    // Create a ServerBlockNoteEditor instance
    const editor = ServerBlockNoteEditor.create();

    // JSON (already parsed on the web tier) takes precedence. The raw markdown is only a
    // fallback, used when JSON is absent, empty, or fails to convert to a valid document.
    // Markdown must be parsed to blocks here because BlockNote is unavailable on the web
    // tier that builds the message.
    const jsonBlocks = content.initialContentJson;
    const hasJsonBlocks = Array.isArray(jsonBlocks) && jsonBlocks.length > 0;

    if (hasJsonBlocks) {
      try {
        editor.blocksToYXmlFragment(jsonBlocks, fragment);
        logger.info('Document seeded from initial JSON content', { documentName });
        return {
          statusCode: "document_loaded",
        };
      } catch (jsonError) {
        // Do not crash on malformed JSON blocks; drop anything partially written and
        // fall through to the markdown fallback below.
        logger.warn('Failed to seed document from JSON, falling back to markdown', {
          documentName,
          error: jsonError instanceof Error ? jsonError.message : String(jsonError),
        });
        if (fragment.length > 0) fragment.delete(0, fragment.length);
      }
    }

    if (content.initialContentMarkdown) {
      const markdownBlocks = await editor.tryParseMarkdownToBlocks(content.initialContentMarkdown);
      editor.blocksToYXmlFragment(markdownBlocks, fragment);
      logger.info('Document seeded from initial markdown content', { documentName });
      return {
        statusCode: "document_loaded",
      };
    }

    logger.warn('No usable initial content to seed document', { documentName });
    return {
      statusCode: "no_initial_content",
      error: 'No usable initial content (JSON empty/invalid and no markdown fallback)',
    }
  } catch (error) {
    logger.error('Error creating document', { error, documentName });
    return {
      statusCode: "unknown_error",
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  } finally {
    if (connection) await connection.disconnect();
  }
}