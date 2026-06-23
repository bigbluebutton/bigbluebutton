import * as React from 'react';
import {
  NestBlockButton as NativeNestBlockButton,
  useComponentsContext,
  useDictionary,
} from '@blocknote/react';
import { RiIndentIncrease } from 'react-icons/ri';
import useActiveBlockHasContent from '../use-active-block-has-content';

// Custom replacement for BlockNote's NestBlockButton. The native button returns
// null when none of the selected blocks have inline content
// (`content !== undefined`). Our LaTeX custom block is declared `content: 'none'`,
// so editing it hides the nest control and breaks the first line of the static
// toolbar.
//
// On blocks with editable inline content we delegate to the native component
// (it already disables itself when nesting is not possible). On content-less
// blocks nesting a formula is meaningless, so we render an inert, disabled
// placeholder that keeps the toolbar layout stable.
function NestBlockButton(): React.ReactElement | null {
  const Components = useComponentsContext()!;
  const dict = useDictionary();
  const hasContent = useActiveBlockHasContent();

  if (hasContent) return <NativeNestBlockButton />;

  return (
    <Components.FormattingToolbar.Button
      className="bn-button"
      data-test="nestBlock"
      isDisabled
      label={dict.formatting_toolbar.nest.tooltip}
      mainTooltip={dict.formatting_toolbar.nest.tooltip}
      icon={<RiIndentIncrease />}
    />
  );
}

export default NestBlockButton;
