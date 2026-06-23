import * as React from 'react';
import { useCallback } from 'react';
import {
  useBlockNoteEditor,
  useComponentsContext,
  useDictionary,
  useEditorState,
} from '@blocknote/react';
import {
  blockHasType,
  defaultProps,
  editorHasBlockWithType,
  mapTableCell,
  TableContent,
} from '@blocknote/core';
import { TableHandlesExtension } from '@blocknote/core/extensions';
import {
  RiAlignCenter,
  RiAlignJustify,
  RiAlignLeft,
  RiAlignRight,
} from 'react-icons/ri';
import { HiChevronDown } from 'react-icons/hi';

type TextAlignment = 'left' | 'center' | 'right' | 'justify';

const ALIGN_ITEMS: { value: TextAlignment; icon: React.ReactElement }[] = [
  { value: 'left', icon: <RiAlignLeft size={16} /> },
  { value: 'center', icon: <RiAlignCenter size={16} /> },
  { value: 'right', icon: <RiAlignRight size={16} /> },
  { value: 'justify', icon: <RiAlignJustify size={16} /> },
];

// TODO: PR https://github.com/TypeCellOS/BlockNote/pull/2728 has been sent to BlockNote
// to have this implemented there - If it's merged, we need to remove this code and use
// their native component.
function TextAlignSelect(): React.ReactElement | null {
  const Components = useComponentsContext()!;
  const editor = useBlockNoteEditor();
  const dict = useDictionary();

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e.isEditable) return null;
      const blocks = e.getSelection()?.blocks ?? [e.getTextCursorPosition().block];
      const firstBlock = blocks[0];

      if (blockHasType(firstBlock, e, firstBlock.type, { textAlignment: defaultProps.textAlignment })) {
        return { alignment: firstBlock.props.textAlignment as TextAlignment, blocks };
      }

      if (blocks.length === 1 && blockHasType(firstBlock, e, 'table')) {
        const cellSelection = e.getExtension(TableHandlesExtension)?.getCellSelection();
        if (!cellSelection || cellSelection.cells.length === 0) return null;
        const { row, col } = cellSelection.cells[0];
        const tableContent = firstBlock.content as TableContent<never, never>;
        const selectedCell = tableContent.rows[row]?.cells[col];
        if (!selectedCell) return null;
        return { alignment: mapTableCell(selectedCell).props.textAlignment as TextAlignment, blocks };
      }

      return null;
    },
  });

  const setTextAlignment = useCallback(
    (alignment: TextAlignment) => {
      if (!state) return;
      editor.focus();
      state.blocks.forEach((block) => {
        if (
          blockHasType(block, editor, block.type, { textAlignment: defaultProps.textAlignment })
          && editorHasBlockWithType(editor, block.type, { textAlignment: defaultProps.textAlignment })
        ) {
          editor.updateBlock(block, { props: { textAlignment: alignment } as never });
        } else if (block.type === 'table') {
          const cellSelection = editor.getExtension(TableHandlesExtension)?.getCellSelection();
          if (!cellSelection) return;

          const newTable = (block.content as TableContent<never, never>).rows.map((row) => ({
            ...row,
            cells: row.cells.map((cell) => mapTableCell(cell)),
          }));

          cellSelection.cells.forEach(({ row, col }) => {
            newTable[row].cells[col] = {
              ...newTable[row].cells[col],
              props: {
                ...newTable[row].cells[col].props,
                textAlignment: alignment,
              },
            };
          });

          editor.updateBlock(block, {
            type: 'table',
            content: {
              ...(block.content as TableContent<never, never>),
              type: 'tableContent',
              rows: newTable,
            } as never,
          });

          editor.setTextCursorPosition(block);
        }
      });
    },
    [editor, state],
  );

  // The selector returns null for blocks without a textAlignment prop (e.g. our
  // LaTeX custom block, declared `content: 'none'`). Returning null here would
  // drop this control from the first line of the static toolbar. Instead render
  // an inert, disabled placeholder so the toolbar layout stays stable; text
  // alignment does not apply to a rendered formula.
  if (!state) {
    return (
      <Components.FormattingToolbar.Button
        className="bn-button"
        isDisabled
        label={dict.formatting_toolbar.align_left.tooltip}
        mainTooltip={dict.formatting_toolbar.align_left.tooltip}
        icon={<RiAlignLeft size={16} />}
      />
    );
  }

  const currentItem = ALIGN_ITEMS.find((a) => a.value === state.alignment)!;

  type TriggerButtonProps = {
    className?: string;
    label?: string;
    mainTooltip?: string;
    leftSection?: React.ReactNode;
    rightSection?: React.ReactNode;
    children?: React.ReactNode;
  };
  const TriggerButton = Components.FormattingToolbar.Button as unknown as React.ComponentType<TriggerButtonProps>;

  return (
    <Components.Generic.Menu.Root>
      <Components.Generic.Menu.Trigger>
        <TriggerButton
          className="bn-button"
          label={dict.formatting_toolbar[`align_${state.alignment}`].tooltip}
          mainTooltip={dict.formatting_toolbar[`align_${state.alignment}`].tooltip}
          leftSection={currentItem.icon}
          rightSection={<HiChevronDown size={10} />}
        >
          <span />
        </TriggerButton>
      </Components.Generic.Menu.Trigger>
      <Components.Generic.Menu.Dropdown className="bn-menu-dropdown">
        {ALIGN_ITEMS.map((a) => (
          <Components.Generic.Menu.Item
            key={a.value}
            icon={a.icon}
            checked={state.alignment === a.value}
            onClick={() => setTextAlignment(a.value)}
          >
            {dict.formatting_toolbar[`align_${a.value}`].tooltip}
          </Components.Generic.Menu.Item>
        ))}
      </Components.Generic.Menu.Dropdown>
    </Components.Generic.Menu.Root>
  );
}

export default TextAlignSelect;
