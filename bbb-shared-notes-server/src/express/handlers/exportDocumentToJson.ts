import hocuspocus from "../../hocuspocus";
import { ServerBlockNoteEditor } from "@blocknote/server-util";

export async function exportDocumentToJson(documentName: string): Promise<string> {
  const connection = await hocuspocus.openDirectConnection(documentName);

  try {
    const doc = connection.document;

    if (!doc) {
      throw new Error('document_not_found');
    }

    const fragment = doc.getXmlFragment("doc");

    // An empty document is a valid state: export it as an empty block array
    // instead of returning an error. See issue #25122.
    if (fragment.length === 0) {
      return JSON.stringify([], null, 2);
    }

    const editor = ServerBlockNoteEditor.create();
    const blocks = editor.yXmlFragmentToBlocks(fragment);

    return JSON.stringify(blocks, null, 2);
  } finally {
    await connection.disconnect();
  }
}
