import styled, { css } from 'styled-components';
import {
  colorDangerDark,
  colorBorder,
  colorOffWhite,
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';

interface ChatMessageProps {
  systemMsg?: boolean;
  $jumbomoji?: boolean;
}

const jumbomojiStyles = css`
  font-size: 2.5em;
  line-height: 1.2;

  & p {
    line-height: 1.2;
  }
`;

export const ChatMessage = styled.div<ChatMessageProps>`
  flex: 1;
  display: flex;
  flex-flow: row;
  flex-direction: column;
  color: ${colorText};
  word-break: break-word;

  ${({ $jumbomoji }) => $jumbomoji && jumbomojiStyles}

  & img {
    max-width: 100%;
    max-height: 100%;
  }

  & p {
    margin: 0;
    white-space: pre-wrap;
  }

  & pre:has(code), p code:not(pre > code) {
    background-color: ${colorOffWhite};
    border: solid 1px ${colorBorder};
    border-radius: 4px;
    padding: 2px;
    margin: 0;
    font-size: 12px;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: anywhere;
  }
  & p code:not(pre > code) {
    color: ${colorDangerDark};
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
