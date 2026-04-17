import hocuspocus from "../../hocuspocus";
import * as Y from "yjs";
import { ServerBlockNoteEditor } from "@blocknote/server-util";

export async function exportDocumentToYjs(documentName: string): Promise<string> {
  const connection = await hocuspocus.openDirectConnection(documentName);
  const doc = connection.document;

  if (!doc) {
    await connection.disconnect();
    throw new Error('document_not_found');
  }

  const fragment = doc.getXmlFragment("doc");

  if (fragment.length === 0) {
    await connection.disconnect();
    throw new Error('document_empty');
  }

  const editor = ServerBlockNoteEditor.create();
  const blocks = editor.yXmlFragmentToBlocks(fragment);

  // Suite Numerique Docs expects BlockNote data in the `document-store` fragment.
  const targetDoc = new Y.Doc();
  const targetFragment = targetDoc.getXmlFragment("document-store");
  editor.blocksToYXmlFragment(blocks, targetFragment);
  const stateUpdate = Y.encodeStateAsUpdate(targetDoc);

  await connection.disconnect();

  return Buffer.from(stateUpdate).toString('base64');
}
