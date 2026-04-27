import hocuspocus from "../../hocuspocus";
import { ServerBlockNoteEditor } from "@blocknote/server-util";

export async function exportDocumentToJson(documentName: string): Promise<string> {
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

  await connection.disconnect();

  return JSON.stringify(blocks, null, 2);
}
