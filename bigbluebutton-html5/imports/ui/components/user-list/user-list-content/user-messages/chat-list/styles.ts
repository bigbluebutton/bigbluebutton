import styled from 'styled-components';
import { colorGray, 
  colorGrayLighter, 
  colorPrimary, 
  userListBg,
} from '/imports/ui/stylesheets/styled-components/palette';
import { borderSize, smPaddingX, lgPaddingY, mdPaddingY } from '/imports/ui/stylesheets/styled-components/general';

const Messages = styled.div`
  flex-grow: 0;
  display: flex;
  flex-flow: column;
  flex-shrink: 0;
  max-height: 30vh;
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
  background: linear-gradient(white 30%, rgba(255,255,255,0)),
    linear-gradient(rgba(255,255,255,0), white 70%) 0 100%,
    /* Shadows */
    radial-gradient(farthest-side at 50% 0, rgba(0,0,0,.2), rgba(0,0,0,0)),
    radial-gradient(farthest-side at 50% 100%, rgba(0,0,0,.2), rgba(0,0,0,0)) 0 100%;

  background-repeat: no-repeat;
  background-color: transparent;
  background-size: 100% 40px, 100% 40px, 100% 14px, 100% 14px;
  background-attachment: local, local, scroll, scroll;

  // Fancy scroll
  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  &::-webkit-scrollbar-button {
    width: 0;
    height: 0;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,.25);
    border: none;
    border-radius: 50px;
  }
  &::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,.5); }
  &::-webkit-scrollbar-thumb:active { background: rgba(0,0,0,.25); }
  &::-webkit-scrollbar-track {
    background: rgba(0,0,0,.25);
    border: none;
    border-radius: 50px;
  }
  &::-webkit-scrollbar-track:hover { background: rgba(0,0,0,.25); }
  &::-webkit-scrollbar-track:active { background: rgba(0,0,0,.25); }
  &::-webkit-scrollbar-corner { background: 0 0; }
  background: linear-gradient(${userListBg} 30%, rgba(255,255,255,0)),
    linear-gradient(rgba(255,255,255,0), ${userListBg} 70%) 0 100%,
    /* Shadows */
    radial-gradient(farthest-side at 50% 0, rgba(0,0,0,.2), rgba(0,0,0,0)),
    radial-gradient(farthest-side at 50% 100%, rgba(0,0,0,.2), rgba(0,0,0,0)) 0 100%;

  outline: none;
  
  &:hover {
    /* Visible in Windows high-contrast themes */
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

const List = styled.div`
margin: 0 0 1px ${mdPaddingY};

[dir="rtl"] & {
  margin: 0 ${mdPaddingY} 1px 0;
}
`;

const ListTransition = styled.div`
  display: flex;
  flex-flow: column;
  margin: 0;
  padding: 0;
  padding-top: ${borderSize};
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

export default {
  Messages,
  Container,
  Separator,
  MessagesTitle,
  ScrollableList,
  List,
  ListTransition,
};
