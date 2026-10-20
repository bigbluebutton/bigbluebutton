import hocuspocus from "../../hocuspocus";
import { createServerEditor } from "../../blocknote/editor";

export async function exportDocumentToMarkdown(documentName: string): Promise<string> {
  const connection = await hocuspocus.openDirectConnection(documentName);

  try {
    const doc = connection.document;

    if (!doc) {
      throw new Error('document_not_found');
    }

    const fragment = doc.getXmlFragment("doc");

    // An empty document is a valid state: export it as empty markdown instead
    // of returning an error. See issue #25122.
    if (fragment.length === 0) {
      return '';
    }

    // Create a server editor with the shared notes schema
    const editor = createServerEditor();

    // Convert Yjs XML Fragment to BlockNote blocks
    const blocks = editor.yXmlFragmentToBlocks(fragment);

    // Convert blocks to Markdown (using type assertion to handle schema differences)
    return await editor.blocksToMarkdownLossy(blocks as any);
  } finally {
    await connection.disconnect();
  }
}
