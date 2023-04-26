import { VirtualizedScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import styled from 'styled-components';
import {
  smPaddingX,
  mdPaddingX,
  mdPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
export const MessageList = styled(VirtualizedScrollboxVertical)`
  flex-flow: column;
  flex-grow: 1;
  flex-shrink: 1;
  margin: 0 auto 0 0;
  right: 0 ${mdPaddingX} 0 0;
  padding-top: 0;
  width: 100%;
  outline-style: none;

  [dir="rtl"] & {
    margin: 0 0 0 auto;
    padding: 0 0 0 ${mdPaddingX};
  }
`;

export const MessageListWrapper = styled.div`
  display: flex;
  flex-flow: column;
  flex-grow: 1;
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
  [dir="rtl"] & {
    padding-right: ${mdPaddingX};
    margin-right: calc(-1 * ${mdPaddingX});
    padding-left: ${mdPaddingY};
    margin-left: calc(-1 * ${mdPaddingX});
  }
`;