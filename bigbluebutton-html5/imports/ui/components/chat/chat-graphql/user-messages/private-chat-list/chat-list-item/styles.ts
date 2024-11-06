import styled from 'styled-components';
import { fontSizeSmall, fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import {
  lgPaddingY,
  lgPadding,
  smPaddingY,
  xlPadding,
  borderSize,
  userIndicatorsOffset,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorGrayDark,
  colorOffWhite,
  listItemBgHover,
  colorGrayLight,
  colorWhite,
  userListBg,
  colorSuccess,
  itemFocusBorder,
  unreadMessagesBg,
  colorGrayLightest,
} from '/imports/ui/stylesheets/styled-components/palette';

interface UserAvatarProps {
  color: string;
  moderator: boolean;
  avatar: string;
  emoji?: string;
}

interface ChatNameMainProps {
  active: boolean;
}

interface ChatListItemProps {
  active: boolean;
  ref: React.Ref<HTMLElement | undefined>;
}

const ChatListItemLink = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  text-decoration: none;
  width: 100%;
`;

const ChatIcon = styled.div`
  flex: 0 0 2.2rem;
`;

const UserAvatar = styled.div<UserAvatarProps>`
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
  ${
  ({ color }: UserAvatarProps) => `
    background-color: ${color};
  `}
  }
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
  ${({ moderator }: UserAvatarProps) => moderator && `
    border-radius: 5px;
  `}
  // ================ image ================
  ${({ avatar, emoji, color }: UserAvatarProps) => avatar?.length !== 0 && !emoji && `
    background-image: url(${avatar});
    background-repeat: no-repeat;
    background-size: contain;
    border: 2px solid ${color};
  `}
  // ================ image ================
  // ================ content ================
  color: ${colorWhite};
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

const ChatHeading = styled.div`
  display: flex;
  align-items: center;
`;

const ChatName = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  justify-content: center;
  width: 50%;
  padding-right: ${smPaddingY};
`;

const ChatNameMain = styled.span`
  margin: 0;
  min-width: 0;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  font-weight: 400;
  font-size: ${fontSizeSmall};
  color: ${colorGrayDark};
  flex-grow: 1;
  line-height: 2;
  text-align: left;
  padding: 0 0 0 ${lgPaddingY};
  text-overflow: ellipsis;

  [dir="rtl"] & {
    text-align: right;
    padding: 0 ${lgPaddingY} 0 0;
  }

  ${({ active }: ChatNameMainProps) => active && `
    background-color: ${listItemBgHover};
  `}
`;

const ChatListItem = styled.button<ChatListItemProps>`
  display: flex;
  flex-flow: row;
  border-radius: 5px;
  cursor: pointer;
  border-color: transparent;
  border-width: 0;

  &:first-child {
    margin-top: 0;
  }

  &:hover {
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
    background-color: ${listItemBgHover};
  }

  &:focus {
    outline: transparent;
    outline-width: ${borderSize};
    outline-style: solid;
    background-color: ${listItemBgHover};
    box-shadow: inset 0 0 0 ${borderSize} ${itemFocusBorder}, inset 1px 0 0 1px ${itemFocusBorder};
  }
  cursor: pointer;
  text-decoration: none;
  flex-grow: 1;
  line-height: 2;
  color: ${colorGrayDark};
  background-color: transparent;
  padding-top: ${lgPaddingY};
  padding-bottom: ${lgPaddingY};
  padding-left: ${lgPaddingY};
  padding-right: ${lgPaddingY};

  ${({ active }: ChatListItemProps) => active && `
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
    background-color: ${colorGrayLightest};
  `}
`;

const ChatThumbnail = styled.div`
  display: flex;
  flex-flow: column;
  color: ${colorGrayLight};
  justify-content: center;
  font-size: 175%;
`;

const UnreadMessages = styled.div`
  display: flex;
  flex-flow: column;
  padding: 10px;
  justify-content: center;
  margin-left: auto;
  [dir="rtl"] & {
    margin-right: auto;
    margin-left: 0;
  }
`;
const UnreadMessagesText = styled.div`
  display: flex;
  flex-flow: column;
  margin: 0;
  justify-content: center;
  color: ${colorWhite};
  line-height: calc(1rem + 1px);
  padding: 0 0.5rem;
  text-align: center;
  border-radius: 0.5rem/50%;
  font-size: 0.8rem;
  background-color: ${unreadMessagesBg};
`;

const ChatWrapper = styled.div`
  pointer-events: auto;
  display: flex;
  width: 100%;
  flex-flow: column;
  gap: ${smPaddingY};
  position: relative;
  font-size: ${fontSizeBase};
  position: relative;

`;

const ChatContent = styled.div`
  display: flex;
  flex-flow: row;
  width: 100%;
  border-radius: 0.5rem;
  background-color: ${colorOffWhite};
`;

const MessageItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: ${lgPadding} ${xlPadding};
`;

export default {
  ChatListItemLink,
  ChatIcon,
  ChatName,
  ChatNameMain,
  ChatHeading,
  ChatListItem,
  ChatThumbnail,
  ChatWrapper,
  ChatContent,
  MessageItemWrapper,
  UnreadMessages,
  UnreadMessagesText,
  UserAvatar,
};
