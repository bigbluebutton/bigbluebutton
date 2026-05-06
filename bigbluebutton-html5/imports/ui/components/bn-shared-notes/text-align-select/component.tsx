import * as React from 'react';
import {
  useBlockNoteEditor,
  useComponentsContext,
  useEditorState,
} from '@blocknote/react';
import {
  RiAlignCenter,
  RiAlignJustify,
  RiAlignLeft,
  RiAlignRight,
} from 'react-icons/ri';

type TextAlignment = 'left' | 'center' | 'right' | 'justify';

const ALIGN_ITEMS: { value: TextAlignment; label: string; icon: React.ReactElement }[] = [
  { value: 'left', label: 'Left', icon: <RiAlignLeft size={16} /> },
  { value: 'center', label: 'Center', icon: <RiAlignCenter size={16} /> },
  { value: 'right', label: 'Right', icon: <RiAlignRight size={16} /> },
  { value: 'justify', label: 'Justify', icon: <RiAlignJustify size={16} /> },
];

function TextAlignSelect(): React.ReactElement | null {
  const Components = useComponentsContext()!;
  const editor = useBlockNoteEditor();

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e.isEditable) return null;
      const blocks = e.getSelection()?.blocks ?? [e.getTextCursorPosition().block];
      const alignment = (blocks[0].props as Record<string, unknown>)?.textAlignment;
      if (typeof alignment !== 'string') return null;
      return { alignment: alignment as TextAlignment, blocks };
    },
  });

  if (!state) return null;

  return (
    <Components.FormattingToolbar.Select
      className="bn-select"
      items={ALIGN_ITEMS.map((a) => ({
        text: a.label,
        icon: a.icon,
        isSelected: state.alignment === a.value,
        onClick: () => {
          editor.focus();
          state.blocks.forEach((block) => {
            editor.updateBlock(block, { props: { textAlignment: a.value } as never });
          });
        },
      }))}
    />
  );
}

export default TextAlignSelect;
