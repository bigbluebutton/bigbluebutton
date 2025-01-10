import styled from 'styled-components';
import { colorText } from '/imports/ui/stylesheets/styled-components/palette';

interface ChatMessageProps {
  emphasizedMessage: boolean;
  systemMsg?: boolean;
}

export const ChatMessage = styled.div<ChatMessageProps>`
  flex: 1;
  display: flex;
  flex-flow: row;
  flex-direction: column;
  color: ${colorText};
  word-break: break-word;

  ${({ emphasizedMessage }) => emphasizedMessage && `
    font-weight: bold;
  `}

  & img {
    max-width: 100%;
    max-height: 100%;
  }

  & p {
    margin: 0;
    white-space: pre-wrap;
  }

  & code {
    white-space: pre-wrap;
  }
  & h1 {
    font-size: 1.5em;
    margin: 0;
  }
  & h2 {
    font-size: 1.3em;
    margin: 0;
  }
  & h3 {
    font-size: 1.1em;
    margin: 0;
  }
  & h4 {
    margin: 0;
  }
  & h5 {
    margin: 0;
  }
  & h6 {
    margin: 0;
  }
`;

export default {
  ChatMessage,
};
