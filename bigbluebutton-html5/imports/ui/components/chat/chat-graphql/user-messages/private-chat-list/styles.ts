import styled from 'styled-components';
import {
  colorGray,
  colorGrayLighter,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  borderSize, smPaddingX, lgPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import deviceInfo from '/imports/utils/deviceInfo';

const { isMobile } = deviceInfo;

const Messages = styled.div`
  flex-grow: 0;
  display: flex;
  flex-flow: column;
  flex-shrink: 0;

  ${!isMobile && `
    max-height: 30vh;
  `}
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${lgPaddingY};
  margin-top: ${smPaddingX};
`;

const Separator = styled.hr`
  margin: 1rem auto;
  width: 2.2rem;
  border: 0;
  border-top: 1px solid ${colorGrayLighter};
`;

const MessagesTitle = styled.h2`
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0 ${smPaddingX};
  color: ${colorGray};
  flex: 1;
  margin: 0;
  flex: 1;
  margin: 0;
`;

const ScrollableList = styled.div`
  overflow-y: auto;
  height: 100%;
  background-color: transparent;

  &:hover {
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
  }

  &:focus,
  &:active {
    border-radius: none;
    box-shadow: inset 0 0 1px ${colorPrimary};
    outline-style: transparent;
  }

  overflow-x: hidden;
  padding-top: 1px;
  padding-right: 1px;
`;

const ListTransition = styled.div`
  display: flex;
  flex-flow: column;
  padding: ${borderSize} 0 0 0;.
  outline: none;
  overflow: hidden;
  flex-shrink: 1;

  &.transition-enter,
  &.transition-appear {
    opacity: 0.01;
  }

  &.transition-enter-active,
  &.transition-appear-active {
    opacity: 1;
    
    &.animationsEnabled {
      transition: all 600ms;
    }
  }

  &.transition-leave {
    opacity: 1;
  }

  &.transition-leave-active {
    opacity: 0;

    &.animationsEnabled {
      transition: all 600ms;
    }
  }
`;

const NoChatsMessage = styled.div`
  height: 100%;
`;

export default {
  Messages,
  Container,
  Separator,
  MessagesTitle,
  ScrollableList,
  ListTransition,
  NoChatsMessage,
};
