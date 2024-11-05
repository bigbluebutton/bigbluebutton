import styled from 'styled-components';
import { smPaddingX } from '/imports/ui/stylesheets/styled-components/general';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import { ButtonElipsis } from '/imports/ui/stylesheets/styled-components/placeholders';

interface MessageListProps {
  isRTL: boolean;
  $hasMessageToolbar: boolean;
}

export const MessageList = styled(ScrollboxVertical)<MessageListProps>`
  flex-flow: column;
  flex-shrink: 1;
  outline-style: none;
  overflow-x: hidden;
  user-select: text;
  height: 100%;
  z-index: 2;
  overflow-y: auto;
  position: relative;
  display: flex;
  padding-bottom: ${smPaddingX};

  ${({ isRTL }) => isRTL && `
    padding-left: ${smPaddingX};
  `}

  ${({ isRTL }) => !isRTL && `
    padding-right: ${smPaddingX};
  `}
`;

export const UnreadButton = styled(ButtonElipsis)`
  flex-shrink: 0;
  width: 100%;
  text-transform: uppercase;
  margin-bottom: .25rem;
  z-index: 3;
`;

export default {
  MessageList,
  UnreadButton,
};
