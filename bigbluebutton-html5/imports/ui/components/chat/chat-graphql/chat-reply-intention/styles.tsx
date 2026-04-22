import styled, { css } from 'styled-components';
import {
  colorDangerDark,
  colorGrayLightest, colorOffWhite,
  colorPrimary,
  colorText,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  mdPadding, smPadding, smPaddingX, xlPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import EmojiButton from '../chat-message-list/page/chat-message/message-toolbar/emoji-button/component';

const Container = styled.div<{ $hidden: boolean; $animations: boolean }>`
  border-radius: 0.375rem;
  background-color: ${colorWhite};
  box-shadow: inset 0 0 0 1px ${colorGrayLightest};
  display: flex;
  align-items: center;
  overflow: hidden;

  [dir='ltr'] & {
    border-right: 0.375rem solid ${colorPrimary};
  }

  [dir='rtl'] & {
    border-left: 0.375rem solid ${colorPrimary};
  }

  ${({ $hidden }) => ($hidden
    ? css`
        height: 0;
        min-height: 0;
      `
    : css`
        min-height: calc(1rlh + ${mdPadding} * 2);
        height: calc(1rlh + ${mdPadding} * 2);
        padding: ${mdPadding} calc(${smPaddingX} * 1.25);
        margin-bottom: ${smPadding};

        [dir='ltr'] & {
          margin-right: ${xlPadding};
        }

        [dir='rtl'] & {
          margin-left: ${xlPadding};
        }
      `
  )}

  ${({ $animations }) => $animations
    && css`
      transition-property: height, min-height;
      transition-duration: 0.1s;
    `}
`;

const Message = styled.div`
  line-height: 1rlh;
  flex-grow: 1;
  min-width: 0;
`;

const HtmlContent = styled.div`
  color: ${colorText};

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
    border: solid 1px ${colorGrayLightest};
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

const CloseBtn = styled(EmojiButton)`
  font-size: 75%;
  height: 1rem;
  padding: 2px;
`;

export default {
  Container,
  CloseBtn,
  Message,
  HtmlContent,
};
