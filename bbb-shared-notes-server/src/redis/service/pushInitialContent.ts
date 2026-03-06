import { ServerBlockNoteEditor } from "@blocknote/server-util";
import hocuspocus from "../../hocuspocus";
import { Logger } from "../../common/logger";

const logger = new Logger('redis.service.pushInitialContent');

export async function pushInitialContent(padId: string, initialContentJson: any): Promise<{ statusCode: string; error?: string; }> {
  const documentName = padId;

  const initialBlocks = initialContentJson;
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

    // Convert blocks to Yjs XML Fragment directly in our document's fragment
    editor.blocksToYXmlFragment(initialBlocks, fragment);

    logger.info('Document created/loaded successfully', { documentName });
    return {
      statusCode: "document_loaded",
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