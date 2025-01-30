import styled from 'styled-components';

import {
  smPaddingY,
  lgPadding,
  $3xlPadding,
  xlPadding,
  mdPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeBase,
  fontSizeSmaller,
} from '/imports/ui/stylesheets/styled-components/typography';

import {
  colorBlueLightest,
  colorGrayLight,
  colorGrayLightest,
} from '/imports/ui/stylesheets/styled-components/palette';
import { ChatTime as ChatTimeBase } from './message-header/styles';
import UserAvatar from '/imports/ui/components/user-avatar/component';

interface ChatWrapperProps {
  sameSender: boolean;
  isSystemSender: boolean;
  isPresentationUpload?: boolean;
  isCustomPluginMessage: boolean;
}

interface ChatContentProps {
  sameSender: boolean;
  isCustomPluginMessage: boolean;
  $isSystemSender: boolean;
  $editing: boolean;
  $highlight: boolean;
  $reactionPopoverIsOpen: boolean;
  $focused: boolean;
  $keyboardFocused: boolean;
}

export const ChatWrapper = styled.div<ChatWrapperProps>`
  pointer-events: auto;
  display: flex;
  flex-flow: column;
  gap: ${smPaddingY};
  position: relative;
  font-size: ${fontSizeBase};
  position: relative;

  [dir='rtl'] & {
    direction: rtl;
  }

  ${({ isPresentationUpload }) => isPresentationUpload && `
      border-left: 2px solid #0F70D7;
      margin-top: 1rem;
      padding: 0.5rem;
      word-break: break-word;
      background-color: #F3F6F9;
    `}
  ${({ isSystemSender }) => isSystemSender && `
    background-color: #fef9f1;
    border-left: 2px solid #f5c67f;
    border-radius: 0px 3px 3px 0px;
    padding: 8px 2px;
  `}
  ${({ isCustomPluginMessage }) => isCustomPluginMessage && `
    margin: 0;
    padding: 0;
  `}
`;

export const ChatContent = styled.div<ChatContentProps>`
  display: flex;
  flex-flow: column;
  width: 100%;
  border-radius: 0.5rem;
  position: relative;

  ${({ $isSystemSender }) => !$isSystemSender && `
    background-color: #f4f6fa;
  `}

  ${({ $highlight }) => $highlight && `
    &:hover {
      background-color: ${colorBlueLightest} !important;
    }
  `}

  ${({
    $editing, $reactionPopoverIsOpen, $focused, $keyboardFocused,
  }) => ($reactionPopoverIsOpen || $editing || $focused || $keyboardFocused)
    && `
    background-color: ${colorBlueLightest} !important;
  `}
`;

export const ChatContentFooter = styled.div`
  justify-content: flex-end;
  gap: 0.25rem;
  position: absolute;
  bottom: 0.25rem;
  line-height: 1;
  font-size: 95%;
  display: none;
  background-color: inherit;
  border-radius: 0.5rem;

  [dir="rtl"] & {
    left: 0.25rem;
  }

  [dir="ltr"] & {
    right: 0.25rem;
  }

  .chat-message-wrapper-focused &,
  .chat-message-wrapper-keyboard-focused &,
  .chat-message-content:focus &,
  .chat-message-content:hover & {
    display: flex;
  }
`;

export const ChatAvatar = styled(UserAvatar)`
  flex: 0 0 2.25rem;
  margin: 0px calc(0.5rem) 0px 0px;
  box-flex: 0;
  position: relative;
  text-align: center;
  font-size: .85rem;
  border: 2px solid transparent;
  user-select: none;
`;

export const Container = styled.div<{ $sequence: number }>`
  display: flex;
  flex-direction: column;

  &:not(:first-of-type) {
    margin-top: calc((${fontSizeSmaller} + ${lgPadding} * 2) / 2);
  }
`;

export const MessageItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: calc(${lgPadding} + 2px) ${$3xlPadding};
`;

export const DeleteMessage = styled.span`
  color: ${colorGrayLight};
  padding: ${mdPadding} ${xlPadding};
  border: 1px solid ${colorGrayLightest};
  border-radius: 0.375rem;
`;

export const ChatHeading = styled.div`
  display: flex;
`;

export const EditLabel = styled.span`
  color: ${colorGrayLight};
  font-style: italic;
  font-size: 75%;
  display: flex;
  align-items: center;
  gap: 0.125rem;
  line-height: 1;
`;

export const ChatTime = styled(ChatTimeBase)`
  font-style: italic;
  color: ${colorGrayLight};
`;
