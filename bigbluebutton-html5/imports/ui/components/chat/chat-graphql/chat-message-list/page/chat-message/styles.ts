import styled, { css } from 'styled-components';

import {
  userIndicatorsOffset,
  smPaddingX,
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
  colorWhite,
  userListBg,
  colorSuccess,
  colorBlueLightest,
  colorGrayLight,
  colorGrayLightest,
} from '/imports/ui/stylesheets/styled-components/palette';

import Header from '/imports/ui/components/common/control-header/component';
import { ChatTime as ChatTimeBase } from './message-header/styles';

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

interface ChatAvatarProps {
  avatar: string;
  color: string;
  moderator: boolean;
  emoji?: string;
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

export const ChatHeader = styled(Header)`
  ${({ isRTL }) => isRTL && `
    padding-left: ${smPaddingX};
  `}

  ${({ isRTL }) => !isRTL && `
    padding-right: ${smPaddingX};
  `}
`;

export const ChatAvatar = styled.div<ChatAvatarProps>`
  flex: 0 0 2.25rem;
  margin: 0px calc(0.5rem) 0px 0px;
  box-flex: 0;
  position: relative;
  height: 2.25rem;
  width: 2.25rem;
  border-radius: 50%;
  text-align: center;
  font-size: .85rem;
  border: 2px solid transparent;
  user-select: none;
  ${({ color }) => css`
    background-color: ${color};
  `}

  &:after,
  &:before {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    padding-top: .5rem;
    padding-right: 0;
    padding-left: 0;
    padding-bottom: 0;
    color: inherit;
    top: auto;
    left: auto;
    bottom: ${userIndicatorsOffset};
    right: ${userIndicatorsOffset};
    border: 1.5px solid ${userListBg};
    border-radius: 50%;
    background-color: ${colorSuccess};
    color: ${colorWhite};
    opacity: 0;
    font-family: 'bbb-icons';
    font-size: .65rem;
    line-height: 0;
    text-align: center;
    vertical-align: middle;
    letter-spacing: -.65rem;
    z-index: 1;

    [dir="rtl"] & {
      left: ${userIndicatorsOffset};
      right: auto;
      padding-right: .65rem;
      padding-left: 0;
    }
  }

  ${({ moderator }) => moderator && `
    border-radius: 5px;
  `}
  
  // ================ image ================
  ${({ avatar, emoji, color }) => avatar?.length !== 0 && !emoji && css`
      background-image: url(${avatar});
      background-repeat: no-repeat;
      background-size: contain;
      border: 2px solid ${color};
    `}
  // ================ image ================

  // ================ content ================
  color: ${colorWhite} !important;
  font-size: 110%;
  text-transform: capitalize;
  display: flex;
  justify-content: center;
  align-items:center;
  // ================ content ================

  & .react-loading-skeleton {
    height: 2.25rem;
    width: 2.25rem;
  }
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
