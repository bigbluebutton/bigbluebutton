import styled from 'styled-components';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import { ButtonElipsis } from '/imports/ui/stylesheets/styled-components/placeholders';
import { mdPadding } from '/imports/ui/stylesheets/styled-components/general';

export const MessageList = styled(ScrollboxVertical)`
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

export const Wrapper = styled.div`
  flex-flow: column;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden auto;
  display: flex;
  height: 100%;
`;

export const ListBox = styled.div`
  display: flex;
  flex-direction: column;
`;
export const PageWrapper = styled.div``;

export default {
  MessageList,
  UnreadButton,
  Wrapper,
  ListBox,
  PageWrapper,
};
