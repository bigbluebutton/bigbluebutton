import hocuspocus from "../../hocuspocus";
import * as Y from "yjs";
import { ServerBlockNoteEditor } from "@blocknote/server-util";

export async function exportDocumentToYjs(documentName: string): Promise<string> {
  const connection = await hocuspocus.openDirectConnection(documentName);

  try {
    const doc = connection.document;

    if (!doc) {
      throw new Error('document_not_found');
    }

    const fragment = doc.getXmlFragment("doc");

    const editor = ServerBlockNoteEditor.create();
    // An empty document is a valid state: export it as a valid (empty) Yjs
    // state instead of returning an error. See issue #25122.
    const blocks = fragment.length > 0 ? editor.yXmlFragmentToBlocks(fragment) : [];

    // Suite Numerique Docs expects BlockNote data in the `document-store` fragment.
    const targetDoc = new Y.Doc();
    const targetFragment = targetDoc.getXmlFragment("document-store");
    editor.blocksToYXmlFragment(blocks, targetFragment);
    const stateUpdate = Y.encodeStateAsUpdate(targetDoc);

    return Buffer.from(stateUpdate).toString('base64');
  } finally {
    await connection.disconnect();
  }
}
