import { ServerBlockNoteEditor } from "@blocknote/server-util";
import * as Y from "yjs";
import hocuspocus from "../../hocuspocus";
import { Logger } from "../../common/logger";

const logger = new Logger('redis.service.pushInitialContent');

// Schema generics are left open (as the raw JSON blocks already are): this tier only
// forwards blocks into the Yjs fragment, it does not depend on the concrete schema.
type Editor = ServerBlockNoteEditor<any, any, any>;

interface InitialContent {
  // BlockNote blocks already parsed on the web tier (sharedNotesInitialContentJson).
  initialContentJson?: any;
  // Raw markdown carried untouched from the create API (sharedNotesInitialContentMarkdown);
  // BlockNote only exists here, so the markdown -> blocks conversion happens on this tier.
  initialContentMarkdown?: string;
}

// Seed the fragment from JSON blocks already parsed on the web tier. Returns a
// result when the blocks are present and convert cleanly; returns null when there
// are no usable blocks or the conversion fails, so the caller falls back to
// markdown. Any partial write is rolled back before falling back.
function seedFromJson(
  editor: Editor,
  jsonBlocks: any,
  fragment: Y.XmlFragment,
  documentName: string,
): { statusCode: string } | null {
  const hasJsonBlocks = Array.isArray(jsonBlocks) && jsonBlocks.length > 0;
  if (!hasJsonBlocks) {
    return null;
  }

  try {
    editor.blocksToYXmlFragment(jsonBlocks, fragment);
    logger.info('Document seeded from initial JSON content', { documentName });
    return { statusCode: "document_loaded" };
  } catch (jsonError) {
    // Do not crash on malformed JSON blocks; drop anything partially written and
    // let the caller fall back to the markdown content.
    logger.warn('Failed to seed document from JSON, falling back to markdown', {
      documentName,
      error: jsonError instanceof Error ? jsonError.message : String(jsonError),
    });
    if (fragment.length > 0) fragment.delete(0, fragment.length);
    return null;
  }
}

// Seed the fragment from raw markdown. Markdown must be parsed to blocks here
// because BlockNote is unavailable on the web tier that builds the message.
// Returns a result when the markdown converts to usable blocks; returns null when
// it produces no blocks or the conversion fails, so the caller falls back to
// no_initial_content. Any partial write is rolled back before falling back.
async function seedFromMarkdown(
  editor: Editor,
  markdown: string,
  fragment: Y.XmlFragment,
  documentName: string,
): Promise<{ statusCode: string } | null> {
  try {
    const markdownBlocks = await editor.tryParseMarkdownToBlocks(markdown);
    if (!Array.isArray(markdownBlocks) || markdownBlocks.length === 0) {
      logger.warn('Markdown parsing produced no usable blocks', { documentName });
      return null;
    }

    editor.blocksToYXmlFragment(markdownBlocks, fragment);
    logger.info('Document seeded from initial markdown content', { documentName });
    return { statusCode: "document_loaded" };
  } catch (markdownError) {
    // Do not crash on malformed markdown; drop anything partially written and
    // let the caller fall back to no_initial_content.
    logger.warn('Failed to seed document from markdown', {
      documentName,
      error: markdownError instanceof Error ? markdownError.message : String(markdownError),
    });
    if (fragment.length > 0) fragment.delete(0, fragment.length);
    return null;
  }
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
    const jsonResult = seedFromJson(editor, content.initialContentJson, fragment, documentName);
    if (jsonResult) {
      return jsonResult;
    }

    if (content.initialContentMarkdown) {
      const markdownResult = await seedFromMarkdown(editor, content.initialContentMarkdown, fragment, documentName);
      if (markdownResult) {
        return markdownResult;
      }
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
