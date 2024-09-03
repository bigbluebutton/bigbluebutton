import styled from 'styled-components';
import {
  systemMessageBackgroundColor,
  systemMessageBorderColor,
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeBase, btnFontWeight } from '/imports/ui/stylesheets/styled-components/typography';

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
  ${({ systemMsg }) => systemMsg && `
  background: ${systemMessageBackgroundColor};
  border: 1px solid ${systemMessageBorderColor};
  border-radius: 0.2rem;
  font-weight: ${btnFontWeight};
  padding: ${fontSizeBase};
  text-color: #1f252b;
  margin-top: 0;
  margin-bottom: 0;
  overflow-wrap: break-word;
  `}
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
`;

export default {
  ChatMessage,
};
