import * as React from 'react';
import {
  useBlockNoteEditor,
  useComponentsContext,
  useDictionary,
  useEditorState,
} from '@blocknote/react';
import {
  RiAlignCenter,
  RiAlignJustify,
  RiAlignLeft,
  RiAlignRight,
} from 'react-icons/ri';

type TextAlignment = 'left' | 'center' | 'right' | 'justify';

const ALIGN_ITEMS: { value: TextAlignment; icon: React.ReactElement }[] = [
  { value: 'left', icon: <RiAlignLeft size={16} /> },
  { value: 'center', icon: <RiAlignCenter size={16} /> },
  { value: 'right', icon: <RiAlignRight size={16} /> },
  { value: 'justify', icon: <RiAlignJustify size={16} /> },
];

function TextAlignSelect(): React.ReactElement | null {
  const Components = useComponentsContext()!;
  const editor = useBlockNoteEditor();
  const dict = useDictionary();

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
        text: dict.formatting_toolbar[`align_${a.value}`].tooltip,
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
