import * as React from 'react';
import { useCallback } from 'react';
import {
  useBlockNoteEditor,
  useComponentsContext,
  useDictionary,
  useEditorState,
} from '@blocknote/react';
import { formatKeyboardShortcut } from '@blocknote/core';
import {
  RiBold,
  RiItalic,
  RiStrikethrough,
  RiUnderline,
} from 'react-icons/ri';

type BasicTextStyle = 'bold' | 'italic' | 'underline' | 'strike';

const ICONS: Record<BasicTextStyle, React.ReactElement> = {
  bold: <RiBold />,
  italic: <RiItalic />,
  underline: <RiUnderline />,
  strike: <RiStrikethrough />,
};

// Custom replacement for BlockNote's BasicTextStyleButton. The native button
// hides itself when none of the selected blocks have inline content
// (`block.content !== undefined`). Our LaTeX custom block is declared
// `content: 'none'`, so selecting/editing it makes every native style button
// return null and the whole static formatting toolbar disappears.
// This version keeps the button mounted regardless of the selected block type:
// it only renders null when the style is missing from the schema or the editor
// is read-only. On blocks without inline content the toggle is simply inert,
// matching the always-visible behaviour of the static toolbar.
function BasicTextStyleButton(
  { basicTextStyle }: { basicTextStyle: BasicTextStyle },
): React.ReactElement | null {
  const dict = useDictionary();
  const Components = useComponentsContext()!;
  const editor = useBlockNoteEditor();

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const styleInSchema = basicTextStyle in e.schema.styleSchema
        && e.schema.styleSchema[basicTextStyle].type === basicTextStyle
        && e.schema.styleSchema[basicTextStyle].propSchema === 'boolean';
      if (!e.isEditable || !styleInSchema) return undefined;
      return { active: basicTextStyle in e.getActiveStyles() };
    },
  });

  const toggleStyle = useCallback(() => {
    editor.focus();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editor.toggleStyles({ [basicTextStyle]: true } as any);
  }, [editor, basicTextStyle]);

  if (state === undefined) return null;

  return (
    <Components.FormattingToolbar.Button
      className="bn-button"
      data-test={basicTextStyle}
      onClick={toggleStyle}
      isSelected={state.active}
      label={dict.formatting_toolbar[basicTextStyle].tooltip}
      mainTooltip={dict.formatting_toolbar[basicTextStyle].tooltip}
      secondaryTooltip={formatKeyboardShortcut(
        dict.formatting_toolbar[basicTextStyle].secondary_tooltip,
        dict.generic.ctrl_shortcut,
      )}
      icon={ICONS[basicTextStyle]}
    />
  );
}

export default BasicTextStyleButton;
