import * as React from 'react';
import {
  UnnestBlockButton as NativeUnnestBlockButton,
  useComponentsContext,
  useDictionary,
} from '@blocknote/react';
import { RiIndentDecrease } from 'react-icons/ri';
import useActiveBlockHasContent from '../use-active-block-has-content';

// Custom replacement for BlockNote's UnnestBlockButton. The native button returns
// null when none of the selected blocks have inline content
// (`content !== undefined`). Our LaTeX custom block is declared `content: 'none'`,
// so editing it hides the unnest control and breaks the first line of the static
// toolbar.
//
// On blocks with editable inline content we delegate to the native component
// (it already disables itself when unnesting is not possible). On content-less
// blocks unnesting a formula is meaningless, so we render an inert, disabled
// placeholder that keeps the toolbar layout stable.
function UnnestBlockButton(): React.ReactElement | null {
  const Components = useComponentsContext()!;
  const dict = useDictionary();
  const hasContent = useActiveBlockHasContent();

  if (hasContent) return <NativeUnnestBlockButton />;

  return (
    <Components.FormattingToolbar.Button
      className="bn-button"
      data-test="unnestBlock"
      isDisabled
      label={dict.formatting_toolbar.unnest.tooltip}
      mainTooltip={dict.formatting_toolbar.unnest.tooltip}
      icon={<RiIndentDecrease />}
    />
  );
}

export default UnnestBlockButton;
