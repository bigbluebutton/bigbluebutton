import styled, { css } from 'styled-components';
import {
  colorDangerDark,
  colorBorder,
  colorOffWhite,
  colorText,
  colorWhite,
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
    /* An image with an alpha channel shows whatever is behind it, so dark artwork
       on a transparent background is nearly unreadable on a dark surface. Give the
       element an opaque light backdrop of its own. It is invisible under an opaque
       image, so it never reads as a frame. Dark mode needs the companion override in
       app/styles.js: DarkReader rewrites this declaration, and only the fix CSS it
       injects verbatim survives. */
    background-color: ${colorWhite};
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
    /* The backdrop above is near-black in both themes, so enlarging a dark
       transparent image would otherwise make it less readable than the thumbnail,
       not more. Same opaque backdrop as the inline image. */
    background-color: ${colorWhite};
  }
`;

export default {
  ChatMessage,
  ImageLightbox,
};
