import styled from 'styled-components';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import { ButtonElipsis } from '/imports/ui/stylesheets/styled-components/placeholders';
import { mdPadding } from '/imports/ui/stylesheets/styled-components/general';

interface MessageListProps {
  isRTL: boolean;
  $hasMessageToolbar: boolean;
}

export const MessageList = styled(ScrollboxVertical)<MessageListProps>`
  flex-flow: column;
  flex-shrink: 1;
  outline-style: none;
  overflow-x: hidden;
  height: 100%;
  z-index: 2;
  overflow-y: auto;
  position: relative;
  padding: 0 ${mdPadding};
`;

export const UnreadButton = styled(ButtonElipsis)`
  flex-shrink: 0;
  width: 100%;
  text-transform: uppercase;
  margin-bottom: .25rem;
  z-index: 3;
`;

export const PageWrapper = styled.div``;

export default {
  MessageList,
  UnreadButton,
  PageWrapper,
};
