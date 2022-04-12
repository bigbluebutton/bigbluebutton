import styled from 'styled-components';
import {
  borderRadius,
  borderSize,
  chatPollMarginSm,
} from '/imports/ui/stylesheets/styled-components/general';
import { lineHeightComputed, fontSizeBase, btnFontWeight } from '/imports/ui/stylesheets/styled-components/typography';
import {
  systemMessageBackgroundColor,
  systemMessageBorderColor,
  systemMessageFontColor,
  highlightedMessageBackgroundColor,
  highlightedMessageBorderColor,
  colorHeading,
  colorGrayLight,
  palettePlaceholderText,
  colorGrayLighter,
  colorPrimary,
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';
import MessageChatItem from './message-chat-item/component';
import Icon from '/imports/ui/components/common/icon/component';

const Item = styled.div`
  padding: calc(${lineHeightComputed} / 4) 0 calc(${lineHeightComputed} / 2) 0;
  font-size: ${fontSizeBase};
  pointer-events: auto;
  [dir="rtl"] & {
    direction: rtl;
  }
`;

const Messages = styled.div`
  > * {
    &:first-child {
      margin-top: calc(${lineHeightComputed} / 4);
    }
  }
`;

const SystemMessageChatItem = styled(MessageChatItem)`
  ${({ border }) => border && `
    background: ${systemMessageBackgroundColor};
    border: 1px solid ${systemMessageBorderColor};
    border-radius: ${borderRadius};
    font-weight: ${btnFontWeight};
    padding: ${fontSizeBase};
    color: ${systemMessageFontColor};
    margin-top: 0px;
    margin-bottom: 0px;
    overflow-wrap: break-word;
  `}

  ${({ border }) => !border && `
    color: ${systemMessageFontColor};
    margin-top: 0px;
    margin-bottom: 0px;
  `}
`;

const Wrapper = styled.div`
  display: flex;
  flex-flow: row;
  flex: 1;
  position: relative;
  margin: ${borderSize} 0 0 ${borderSize};

  ${({ isSystemSender }) => isSystemSender && `
    background-color: ${highlightedMessageBackgroundColor};
    border-left: 2px solid ${highlightedMessageBorderColor};
    border-radius: 0px 3px 3px 0px;
    padding: 8px 2px;
  `}
  
  [dir="rtl"] & {
    margin: ${borderSize} ${borderSize} 0 0;
  }
`;

const AvatarWrapper = styled.div`
  flex-basis: 2.25rem;
  flex-shrink: 0;
  flex-grow: 0;
  margin: 0 calc(${lineHeightComputed} / 2) 0 0;

  [dir="rtl"] & {
    margin: 0 0 0 calc(${lineHeightComputed} / 2);
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-flow: column;
  overflow-x: hidden;
  width: calc(100% - 1.7rem);
`;

const Meta = styled.div`
  display: flex;
  flex: 1;
  flex-flow: row;
  line-height: 1.35;
  align-items: baseline;
`;

const Name = styled.div`
  display: flex;
  min-width: 0;
  font-weight: 600;
  position: relative;

  &:first-child {
    min-width: 0;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  ${({ isOnline }) => isOnline && `
    color: ${colorHeading};
  `}

  ${({ isOnline }) => !isOnline && `
    text-transform: capitalize;
    font-style: italic;

    & > span {
      text-align: right;
      padding: 0 .1rem 0 0;

      [dir="rtl"] & {
        text-align: left;
        padding: 0 0 0 .1rem;
      }
    }
  `}
`;

const Offline = styled.span`
  color: ${colorGrayLight};
  font-weight: 100;
  text-transform: lowercase;
  font-style: italic;
  font-size: 90%;
  line-height: 1;
  align-self: center;
`;

const Time = styled.time`
  flex-shrink: 0;
  flex-grow: 0;
  flex-basis: 3.5rem;
  color: ${palettePlaceholderText};
  text-transform: uppercase;
  font-size: 75%;
  margin: 0 0 0 calc(${lineHeightComputed} / 2);

  [dir="rtl"] & {
    margin: 0 calc(${lineHeightComputed} / 2) 0 0;
  }

  & > span {
    vertical-align: sub;
  }
`;

const ChatItem = styled(MessageChatItem)`
  flex: 1;
  margin-top: calc(${lineHeightComputed} / 3);
  margin-bottom: 0;
  color: ${colorText};
  word-wrap: break-word;

  ${({ hasLink }) => hasLink && `
    & > a {
      color: ${colorPrimary};
    }
  `}

  ${({ emphasizedMessage }) => emphasizedMessage && `
    font-weight: bold;
  `}
`;

const PollIcon = styled(Icon)`
  bottom: 1px;
`;

const PollMessageChatItem = styled(MessageChatItem)`
  flex: 1;
  margin-top: calc(${lineHeightComputed} / 3);
  margin-bottom: 0;
  color: ${colorText};
  word-wrap: break-word;

  background: ${systemMessageBackgroundColor};
  border: solid 1px ${colorGrayLighter};
  border-radius: ${borderRadius};
  padding: ${chatPollMarginSm};
  padding-left: 1rem;
  margin-top: ${chatPollMarginSm} !important;
`;

export default {
  Item,
  Messages,
  SystemMessageChatItem,
  Wrapper,
  AvatarWrapper,
  Content,
  Meta,
  Name,
  Offline,
  Time,
  ChatItem,
  PollIcon,
  PollMessageChatItem,
};
