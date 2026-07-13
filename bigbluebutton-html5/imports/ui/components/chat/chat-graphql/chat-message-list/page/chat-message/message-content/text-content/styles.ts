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
    max-width: min(100%, 400px);
    max-height: 300px;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 4px;
  }

  & p {
    margin: 0;
    white-space: pre-wrap;
  }

  & pre:has(code),
  p code:not(pre > code) {
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

const ImageLightbox = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: zoom-out;

  & img {
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 4px;
  }
`;

export default {
  ChatMessage,
  ImageLightbox,
};
