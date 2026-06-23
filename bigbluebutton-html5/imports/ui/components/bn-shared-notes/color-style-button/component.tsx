import * as React from 'react';
import {
  ColorStyleButton as NativeColorStyleButton,
  useComponentsContext,
  useDictionary,
} from '@blocknote/react';
import { RiFontColor } from 'react-icons/ri';
import useActiveBlockHasContent from '../use-active-block-has-content';

// Custom replacement for BlockNote's ColorStyleButton. The native button returns
// null when none of the selected blocks have inline content
// (`content !== undefined`). Our LaTeX custom block is declared `content: 'none'`,
// so editing it hides the color control and breaks the first line of the static
// toolbar.
//
// On blocks with editable inline content we delegate to the native component
// (full text/background color picker). On content-less blocks text color does
// not apply to the rendered formula, so we render an inert, disabled placeholder
// that keeps the toolbar layout stable.
function ColorStyleButton(): React.ReactElement | null {
  const Components = useComponentsContext()!;
  const dict = useDictionary();
  const hasContent = useActiveBlockHasContent();

  if (hasContent) return <NativeColorStyleButton />;

  return (
    <Components.FormattingToolbar.Button
      className="bn-button"
      data-test="colors"
      isDisabled
      label={dict.formatting_toolbar.colors.tooltip}
      mainTooltip={dict.formatting_toolbar.colors.tooltip}
      icon={<RiFontColor />}
    />
  );
}

export default ColorStyleButton;
