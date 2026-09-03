import React from 'react';
import { BBBTextAreaInput } from '@bigbluebutton/bbb-ui-components-react/TextAreaInput';

type BBBTextAreaInputProps = React.ComponentProps<typeof BBBTextAreaInput>;
type PollTextAreaProps = Omit<BBBTextAreaInputProps, 'inputRef'>;

/**
 * The library's textarea hands its node out through `inputRef`, while the poll panel
 * (and styled-components' `as`) passes a plain `ref`. Bridging the two here keeps the
 * ref API uniform, so the same styled component can render either this or the
 * drag-and-drop variant without the caller knowing which one it got.
 */
const PollTextArea = React.forwardRef<HTMLTextAreaElement, PollTextAreaProps>((props, ref) => (
  <BBBTextAreaInput
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    inputRef={ref as BBBTextAreaInputProps['inputRef']}
  />
));

PollTextArea.displayName = 'PollTextArea';

export default PollTextArea;
