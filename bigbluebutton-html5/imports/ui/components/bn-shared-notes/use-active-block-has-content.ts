import { useBlockNoteEditor, useEditorState } from '@blocknote/react';

// Returns whether the active selection contains at least one block with editable
// inline content (`content !== undefined`).
//
// BlockNote's stock toolbar components (BlockTypeSelect, ColorStyleButton,
// NestBlockButton, UnnestBlockButton) hide themselves - return null - when this
// is false. Our LaTeX custom block is declared `content: 'none'`, so selecting
// or editing it makes those components disappear and tears the first line of the
// static formatting toolbar apart. The custom wrappers in the sibling folders
// use this flag to keep those components mounted (inert) on content-less blocks,
// mirroring the always-visible behaviour expected from a static toolbar.
export default function useActiveBlockHasContent(): boolean {
  const editor = useBlockNoteEditor();

  return useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e.isEditable) return false;
      const blocks = e.getSelection()?.blocks ?? [e.getTextCursorPosition().block];
      return blocks.some((block) => block.content !== undefined);
    },
  });
}
