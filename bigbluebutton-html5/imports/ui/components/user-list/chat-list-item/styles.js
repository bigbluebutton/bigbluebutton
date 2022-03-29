import styled from 'styled-components';

import Styled from '/imports/ui/components/user-list/styles';
import ContentStyled from '/imports/ui/components/user-list/user-list-content/styles';
import { fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';
import {
  lgPaddingY,
  smPaddingY,
  borderSize,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorGrayDark,
  colorOffWhite,
  listItemBgHover,
  colorGrayLight,
} from '/imports/ui/stylesheets/styled-components/palette';

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

  ${({ active }) => active && `
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
};
