import styled from 'styled-components';
import { colorWhite, colorPrimary, colorGrayLighter } from '/imports/ui/stylesheets/styled-components/palette';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

interface ChatProps {
  isChrome: boolean;
  isRTL: boolean;
}

export const Chat = styled.div<ChatProps>`
  background-color: ${colorWhite};
  padding: 16px;
  padding-bottom: 0;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: space-around;
  overflow: hidden;
  height: 85%;
  border-radius: 16px;
  user-select: none;

  a {
    color: ${colorPrimary};
    text-decoration: none;

    &:focus {
      color: ${colorPrimary};
      text-decoration: underline;
    }
    &:hover {
      filter: brightness(90%);
      text-decoration: underline;
    }
    &:active {
      filter: brightness(85%);
      text-decoration: underline;
    }
    &:hover:focus {
      filter: brightness(90%);
      text-decoration: underline;
    }
    &:focus:active {
      filter: brightness(85%);
      text-decoration: underline;
    }
  }
  u {
    text-decoration-line: none;
  }

  ${({ isChrome }) => isChrome && `
    transform: translateZ(0);
  `}

  @media ${smallOnly} {
    transform: none !important;
  }
`;

const ChatContent = styled.div`
  height: 100%;
  display: contents;
`;

const ChatMessages = styled.div`
  user-select: text;
`;

const Separator = styled.hr`
  margin: 1rem auto;
  width: 100%;
  border: 0;
  border-top: 1px solid ${colorGrayLighter};
`;

export default { Chat, ChatMessages, ChatContent, Separator };
