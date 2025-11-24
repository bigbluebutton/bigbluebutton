import styled, { css } from 'styled-components';
import {
  colorGrayLighter,
  colorGrayLightest,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  borderRadius, lgPadding, smPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import EmojiPickerComponent from '/imports/ui/components/emoji-picker/component';
import BaseEmojiButton from './emoji-button/component';

interface RootProps {
  $reactionPopoverIsOpen: boolean;
}

const Root = styled.div<RootProps>`
  padding: ${smPadding};
  justify-content: flex-end;
  display: none;
  position: absolute;
  bottom: 100%;
  transform: translateY(50%);
  z-index: 10;

  [dir='ltr'] & {
    right: 0;
  }

  [dir='rtl'] & {
    left: 0;
  }

  .chat-message-content:hover &,
  .chat-message-content:focus &,
  .chat-message-container:focus &,
  .chat-message-container-keyboard-focused &,
  &:hover,
  &:focus-within {
    display: flex;
  }

  ${({ $reactionPopoverIsOpen }) => ($reactionPopoverIsOpen && css`
    display: flex;
  `)}
`;

const Container = styled.div`
  max-width: max-content;
  display: flex;
  border-radius: 1rem;
  background-color: ${colorWhite};
  box-shadow: 0 0.125rem 0.125rem 0 ${colorGrayLighter};
  padding: ${smPadding} ${lgPadding};
  gap: ${smPadding};
`;

const EmojiPickerWrapper = styled.div`
  width: 100%;
  bottom: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  border: 1px solid ${colorGrayLighter};
  border-radius: ${borderRadius};
  box-shadow: 0 0.125rem 10px rgba(0,0,0,0.1);
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

const EmojiButton = styled(BaseEmojiButton)``;

const EmojiPicker = styled(EmojiPickerComponent)`
  position: relative;
`;

const Divider = styled.div`
  width: 0.125rem;
  height: 75%;
  border-radius: 0.5rem;
  background-color: ${colorGrayLightest};
  align-self: center;
`;

export {
  Container,
  EmojiPicker,
  EmojiPickerWrapper,
  EmojiButton,
  Root,
  Divider,
};
