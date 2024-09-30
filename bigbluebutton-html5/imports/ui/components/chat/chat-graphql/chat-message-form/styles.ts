/* eslint-disable @typescript-eslint/ban-ts-comment */
import styled from 'styled-components';
import {
  colorBlueLight,
  colorText,
  colorGrayLighter,
  colorPrimary,
  colorDanger,
  colorGrayDark,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  smPaddingX,
  smPaddingY,
  borderRadius,
  borderSize,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import TextareaAutosize from 'react-autosize-textarea';
import EmojiPickerComponent from '/imports/ui/components/emoji-picker/component';
import Button from '/imports/ui/components/common/button/component';

interface FormProps {
  isRTL: boolean;
}

const Form = styled.form<FormProps>`
  flex-grow: 0;
  flex-shrink: 0;
  align-self: flex-end;
  width: 100%;
  position: relative;
  margin-top: .2rem;

  ${({ isRTL }) => isRTL && `
    padding-left: ${smPaddingX};
  `}

  ${({ isRTL }) => !isRTL && `
    padding-right: ${smPaddingX};
  `}
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const Input = styled(TextareaAutosize)`
  flex: 1;
  background: #fff;
  background-clip: padding-box;
  margin: 0;
  color: ${colorText};
  -webkit-appearance: none;
  padding: calc(${smPaddingY} * 2.5) calc(${smPaddingX} * 1.25);
  resize: none;
  transition: none;
  border-radius: ${borderRadius};
  font-size: ${fontSizeBase};
  line-height: 1;
  min-height: 2.5rem;
  max-height: 10rem;
  border: 1px solid ${colorGrayLighter};
  box-shadow: 0 0 0 1px ${colorGrayLighter};

  &:disabled,
  &[disabled] {
    cursor: not-allowed;
    opacity: .75;
    background-color: rgba(167,179,189,0.25);
  }

  &:focus {
    border-radius: ${borderSize};
    box-shadow: 0 0 0 ${borderSize} ${colorBlueLight}, inset 0 0 0 1px ${colorPrimary};
  }

  &:hover,
  &:active,
  &:focus {
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
  }
`;

// @ts-ignore - as button comes from JS, we can't provide its props
const SendButton = styled(Button)`
  margin:0 0 0 ${smPaddingX};
  align-self: center;
  font-size: 0.9rem;

  [dir="rtl"]  & {
    margin: 0 ${smPaddingX} 0 0;
    -webkit-transform: scale(-1, 1);
    -moz-transform: scale(-1, 1);
    -ms-transform: scale(-1, 1);
    -o-transform: scale(-1, 1);
    transform: scale(-1, 1);
  }
`;

const EmojiButtonWrapper = styled.div``;

// @ts-ignore - as button comes from JS, we can't provide its props
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

const EmojiPickerWrapper = styled.div`
position: absolute;
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

const ChatMessageError = styled.div`
  color: ${colorDanger};
  font-size: calc(${fontSizeBase} * .75);
  color: ${colorGrayDark};
  text-align: left;
  padding: ${borderSize} 0;
  word-break: break-word;
  position: relative;
  margin-right: 0.05rem;
  margin-left: 0.05rem;
`;

const EmojiPicker = styled(EmojiPickerComponent)`
  position: relative;
`;

export default {
  Form,
  Wrapper,
  Input,
  SendButton,
  EmojiButton,
  EmojiButtonWrapper,
  EmojiPicker,
  EmojiPickerWrapper,
  ChatMessageError,
};
