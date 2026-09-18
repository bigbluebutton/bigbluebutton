import { createContext, useContext } from 'react';

// Bridges the notes kebab menu (which owns the "Import from Markdown" trigger) and
// the BlockNote editor (which owns the document). The kebab lives in a separate
// subtree from the editor, so the open/close state is lifted to the shared Notes
// parent and shared through this context. The modal itself is rendered next to the
// editor so it can call editor.replaceBlocks directly, keeping the editor instance
// encapsulated inside bn-shared-notes.
export interface SharedNotesImportContextValue {
  isImportModalOpen: boolean;
  openImportModal: () => void;
  closeImportModal: () => void;
}

export const SharedNotesImportContext = createContext<SharedNotesImportContextValue>({
  isImportModalOpen: false,
  openImportModal: () => {},
  closeImportModal: () => {},
});

export const useSharedNotesImport = (): SharedNotesImportContextValue => useContext(SharedNotesImportContext);
