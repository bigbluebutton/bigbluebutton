import * as React from 'react';
import {
  BlockTypeSelect as NativeBlockTypeSelect,
  useComponentsContext,
} from '@blocknote/react';
import { RiSquareRoot } from 'react-icons/ri';
import useActiveBlockHasContent from '../use-active-block-has-content';

// Custom replacement for BlockNote's BlockTypeSelect. The native select returns
// null when no default block-type item matches the active block, which is the
// case for our LaTeX custom block (`content: 'none'`, type not in the default
// block-type list). That makes the first line of the static toolbar lose its
// block-type control while editing a formula.
//
// On blocks with editable inline content we delegate to the native component
// (full block-type switching). On content-less blocks we render an inert,
// disabled select that still shows the current block ("LaTeX"), keeping the
// toolbar layout stable. Switching a formula into a paragraph/heading from here
// is meaningless, hence disabled.
function BlockTypeSelect(): React.ReactElement | null {
  const Components = useComponentsContext()!;
  const hasContent = useActiveBlockHasContent();

  if (hasContent) return <NativeBlockTypeSelect />;

  return (
    <Components.FormattingToolbar.Select
      className="bn-select"
      isDisabled
      items={[
        {
          text: 'LaTeX',
          icon: <RiSquareRoot size={16} />,
          isSelected: true,
          onClick: () => {},
        },
      ]}
    />
  );
}

export default BlockTypeSelect;
