import { EditorContent } from '@tiptap/react';
import styled, { css } from 'styled-components';
import {
  btnPrimaryHoverBg, colorBlueLight, colorDanger, colorGrayDark, colorGrayLighter,
  colorGrayLightest, colorOffWhite, colorPrimary, colorText, colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import EmojiPickerComponent from '/imports/ui/components/emoji-picker/component';
import { borderRadius } from '@mui/system';
import { borderSize, smPaddingX } from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';

const ChatEditorContent = styled(EditorContent)`
  max-height: 150px;
  overflow: auto;
  padding: 0 0.5rem;

  .tiptap {
    outline: none;
    color: ${colorText};

    p.is-editor-empty:first-child::before {
      color: #adb5bd;
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }
  }
`;

const BaseButton = styled.button`
  display: flex;
  background: none;
  border: none;
  outline: none;
  border-radius: 6px;
  padding: 6px;
  line-height: 1;
  cursor: pointer;

  &:disabled {
    opacity: .5;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const ToolButton = styled(BaseButton)<{ $active?: boolean;}>`
  color: ${colorText};

  ${({ $active }) => $active && css`
    background: ${colorOffWhite};

    &:hover,
    &:focus {
      background: ${colorGrayLightest};
    }

    &:hover:focus {
      opacity: .75;
    }
  `}

  ${({ $active }) => !$active && css`
    background: none;

    &:hover,
    &:focus {
      background: ${colorOffWhite};
    }

    &:hover:focus {
      opacity: .75;
    }
  `}
`;

const SendButton = styled(BaseButton)`
  background: ${colorPrimary};
  color: ${colorWhite};

  &:hover,
  &:focus {
    background: ${btnPrimaryHoverBg};
  }

  &:hover:focus {
    opacity: .75;
  }
`;

const ClearButton = styled(BaseButton)`
  background: ${colorOffWhite};

  &:hover,
  &:focus {
    background: ${colorGrayLightest};
  }

  &:hover:focus {
    opacity: .75;
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-inline-start: 4px;
`;

const EmojiPicker = styled(EmojiPickerComponent)`
  position: relative;
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

const Form = styled.form<{ $isRTL?: boolean }>`
  border: 1px solid ${colorGrayLightest};
  border-radius: 0.75rem;
  flex-shrink: 0;
  flex-grow: 0;
  margin-top: 0.2rem;
  padding: 0.5rem;
  position: relative;

  ${({ $isRTL }) => $isRTL && `
    margin-left: ${smPaddingX};
  `}

  ${({ $isRTL }) => !$isRTL && `
    margin-right: ${smPaddingX};
  `}

  &:focus-within {
    border: 1px solid ${colorBlueLight};
  }
`;

const Toolbar = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  align-items: center;
`;

const Divider = styled.div`
  width: 1px;
  height: 1rem;
  border-radius: 0.5rem;
  background-color: ${colorGrayLightest};
`;

export default {
  ChatEditorContent,
  ChatMessageError,
  ClearButton,
  Controls,
  Divider,
  EmojiPicker,
  EmojiPickerWrapper,
  Form,
  SendButton,
  Toolbar,
  ToolButton,
};
