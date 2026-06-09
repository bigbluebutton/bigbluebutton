import hocuspocus from "../../hocuspocus";
import { ServerBlockNoteEditor } from "@blocknote/server-util";

export async function exportDocumentToMarkdown(documentName: string): Promise<string> {
  const connection = await hocuspocus.openDirectConnection(documentName);
  const doc = connection.document;

  if (!doc) {
    await connection.disconnect();
    throw new Error('document_not_found');
  }

  const fragment = doc.getXmlFragment("doc");

  // An empty document is a valid state: export it as empty markdown instead
  // of returning an error. See issue #25122.
  if (fragment.length === 0) {
    await connection.disconnect();
    return '';
  }

  // Create a ServerBlockNoteEditor instance
  const editor = ServerBlockNoteEditor.create();

  // Convert Yjs XML Fragment to BlockNote blocks
  const blocks = editor.yXmlFragmentToBlocks(fragment);

  // Convert blocks to Markdown (using type assertion to handle schema differences)
  const markdownContent = await editor.blocksToMarkdownLossy(blocks as any);

  await connection.disconnect();

  return markdownContent;
}
