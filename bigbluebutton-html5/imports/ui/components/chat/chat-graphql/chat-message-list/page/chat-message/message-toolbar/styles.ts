import styled, { css } from 'styled-components';
import {
  colorGrayLighter,
  colorOffWhite,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import { borderRadius, smPaddingX } from '/imports/ui/stylesheets/styled-components/general';
import EmojiPickerComponent from '/imports/ui/components/emoji-picker/component';
import Button from '/imports/ui/components/common/button/component';

const Container = styled.div<{ $sequence: number }>`
  height: calc(1.5rem + 12px);
  line-height: calc(1.5rem + 8px);
  max-width: 184px;
  overflow: hidden;
  display: none;
  position: absolute;
  right: 0;
  border: 1px solid ${colorOffWhite};
  border-radius: 8px;
  padding: 1px;
  background-color: ${colorWhite};

  #chat-message-wrapper:hover & {
    display: flex;
  }

  ${({ $sequence }) => (($sequence === 1)
    ? css`
      bottom: 0;
      transform: translateY(50%);
    `
    : css`
      top: 0;
      transform: translateY(-50%);
    `)
}
`;

const EmojiPickerWrapper = styled.div`
  bottom: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  border: 1px solid ${colorGrayLighter};
  border-radius: ${borderRadius};
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;

  .emoji-mart {
    max-width: 100% !important;
  }

  .emoji-mart-anchor {
    cursor: pointer;
  }

  .emoji-mart-emoji {
    cursor: pointer !important;
  }

  .emoji-mart-category-list {
    span {
      cursor: pointer !important;
      display: inline-block !important;
    }
  }
`;

// @ts-ignore
const EmojiButton = styled(Button)`
  margin:0 0 0 ${smPaddingX};
  align-self: center;
  font-size: 0.5rem;

  [dir="rtl"]  & {
    margin: 0 ${smPaddingX} 0 0;
    -webkit-transform: scale(-1, 1);
    -moz-transform: scale(-1, 1);
    -ms-transform: scale(-1, 1);
    -o-transform: scale(-1, 1);
    transform: scale(-1, 1);
  }
`;

const EmojiPicker = styled(EmojiPickerComponent)`
  position: relative;
`;

export {
  Container,
  EmojiPicker,
  EmojiPickerWrapper,
  EmojiButton,
};
