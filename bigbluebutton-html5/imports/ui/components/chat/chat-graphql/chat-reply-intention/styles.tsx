import styled, { css } from 'styled-components';
import {
  colorGrayLightest,
  colorOffWhite,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  mdPadding, smPadding, smPaddingX, xlPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import EmojiButton from '../chat-message-list/page/chat-message/message-toolbar/emoji-button/component';

const Container = styled.div<{ $hidden: boolean; $animations: boolean }>`
  border-radius: 0.375rem;
  background-color: ${colorOffWhite};
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px ${colorGrayLightest};
  display: flex;

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
        min-height: calc(1rem + ${mdPadding} * 2);
        height: calc(1rem + ${mdPadding} * 2);
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

const Typography = styled.div`
  line-height: 1;
  font-size: 1rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Message = styled(Typography)`
  font-size: 1rem;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  flex-grow: 1;
`;

const CloseBtn = styled(EmojiButton)`
  font-size: 75%;
  height: 1rem;
  padding: 0;
`;

export default {
  Container,
  CloseBtn,
  Message,
};
