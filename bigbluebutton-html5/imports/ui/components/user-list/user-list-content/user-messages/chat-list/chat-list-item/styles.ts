import styled from 'styled-components';
import Styled from '/imports/ui/components/user-list/styles';
import ContentStyled from '/imports/ui/components/user-list/user-list-content/styles';
import { fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';
import {
  lgPaddingY,
  smPaddingY,
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
} from '/imports/ui/stylesheets/styled-components/palette';

interface UserAvatarProps {
  color: string
  moderator: boolean
  avatar: string
  emoji: string
}

interface ChatNameMainProps {
  active: boolean
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

const UserAvatar = styled.div`
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
  ${({ avatar, emoji }: UserAvatarProps) => avatar?.length !== 0 && !emoji && `
    background-image: url(${avatar});
    background-repeat: no-repeat;
    background-size: contain;
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

const ChatListItem = styled(Styled.ListItem)`
  cursor: pointer;
  text-decoration: none;
  flex-grow: 1;
  line-height: 2;
  color: ${colorGrayDark};
  background-color: ${colorOffWhite};
  padding-top: ${lgPaddingY};
  padding-bottom: ${lgPaddingY};
  padding-left: ${lgPaddingY};
  padding-right: 0;
  margin-left: ${borderSize};
  margin-top: ${borderSize};
  margin-bottom: ${borderSize};
  margin-right: 0;

  [dir="rtl"] & {
    padding-left: 0;
    padding-right: ${lgPaddingY};
    margin-left: 0;
    margin-right: ${borderSize};
  }
`;

const ChatThumbnail = styled.div`
  display: flex;
  flex-flow: column;
  color: ${colorGrayLight};
  justify-content: center;
  font-size: 175%;
`;

const UnreadMessages = styled(ContentStyled.UnreadMessages)``;
const UnreadMessagesText = styled(ContentStyled.UnreadMessagesText)``;

export default {
  ChatListItemLink,
  ChatIcon,
  ChatName,
  ChatNameMain,
  ChatListItem,
  ChatThumbnail,
  UnreadMessages,
  UnreadMessagesText,
  UserAvatar,
};
