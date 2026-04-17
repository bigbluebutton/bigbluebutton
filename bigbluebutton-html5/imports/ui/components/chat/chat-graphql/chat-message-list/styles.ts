import styled from 'styled-components';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import { ButtonElipsis } from '/imports/ui/stylesheets/styled-components/placeholders';
import { mdPadding, smPaddingX } from '/imports/ui/stylesheets/styled-components/general';

interface MessageListProps {
  isRTL: boolean;
  $hasMessageToolbar: boolean;
}

interface UnreadButtonProps {
  isRTL: boolean;
}

export const MessageList = styled(ScrollboxVertical)<MessageListProps>`
  flex-flow: column;
  outline-style: none;
  overflow-x: hidden;
  height: 100%;
  width: 100%;
  z-index: 2;
  overflow-y: auto;
  position: absolute;
  display: flex;
  padding: 0 ${mdPadding} ${smPaddingX};
`;

export const UnreadButton = styled(ButtonElipsis)<UnreadButtonProps>`
  flex-shrink: 0;
  text-transform: uppercase;
  margin-bottom: .25rem;
  z-index: 3;
  position: absolute;
  bottom: 0;

  ${({ isRTL }) => isRTL && `
    left: ${smPaddingX};
    right: 0;
  `}

  ${({ isRTL }) => !isRTL && `
    left: 0;
    right: ${smPaddingX};
  `}
`;

export const PageWrapper = styled.div``;

export const MessageListWrapper = styled.div`
  position: relative;
  flex: 1;
  overflow: hidden;
`;

export const Content = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

export default {
  MessageList,
  MessageListWrapper,
  UnreadButton,
  PageWrapper,
  Content,
};
