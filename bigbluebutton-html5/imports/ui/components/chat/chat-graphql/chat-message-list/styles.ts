import styled from 'styled-components';
import {
  smPaddingX,
  mdPaddingX,
  mdPaddingY,
  borderRadius,
} from '/imports/ui/stylesheets/styled-components/general';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import { colorGrayDark } from '/imports/ui/stylesheets/styled-components/palette';
import { ButtonElipsis } from '/imports/ui/stylesheets/styled-components/placeholders';

export const MessageListWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-flow: column;
  flex-shrink: 1;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  padding-left: ${smPaddingX};
  margin-left: calc(-1 * ${mdPaddingX});
  padding-right: ${smPaddingX};
  margin-right: calc(-1 * ${mdPaddingY});
  padding-bottom: ${mdPaddingX};
  z-index: 2;
  [dir='rtl'] & {
    padding-right: ${mdPaddingX};
    margin-right: calc(-1 * ${mdPaddingX});
    padding-left: ${mdPaddingY};
    margin-left: calc(-1 * ${mdPaddingX});
  }
`;

export const MessageList = styled(ScrollboxVertical)`
  flex-flow: column;
  flex-shrink: 1;
  right: 0 ${mdPaddingX} 0 0;
  padding-top: 0;
  outline-style: none;
  overflow-x: hidden;

  [dir='rtl'] & {
    margin: 0 0 0 auto;
    padding: 0 0 0 ${mdPaddingX};
  }
  display: block;
`;

export const ButtonLoadMore = styled.button`
  width: 100%;
  min-height: 1.5rem;
  margin-bottom: 0.75rem;
  background-color: transparent;
  border-radius: ${borderRadius};
  border: 1px ridge ${colorGrayDark};
`;

export const UnreadButton = styled(ButtonElipsis)`
  flex-shrink: 0;
  width: 100%;
  text-transform: uppercase;
  margin-bottom: .25rem;
  z-index: 3;
`;

export default {
  MessageListWrapper,
  MessageList,
  UnreadButton,
};
