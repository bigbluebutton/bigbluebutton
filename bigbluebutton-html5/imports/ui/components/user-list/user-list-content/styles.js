import styled from 'styled-components';

import Styled from '/imports/ui/components/user-list/styles';
import { FlexColumn } from '/imports/ui/stylesheets/styled-components/placeholders';
import {
  smPaddingX,
  lgPaddingY,
  borderSize,
  mdPaddingY,
  mdPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorPrimary,
  userListBg,
  colorWhite,
  colorOffWhite,
  colorGrayDark,
  colorGrayLight,
  colorGrayLighter,
  listItemBgHover,
  itemFocusBorder,
  unreadMessagesBg,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';

const Content = styled(FlexColumn)`
  flex-grow: 1;
  overflow: hidden;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${lgPaddingY};
  margin-top: ${smPaddingX};
`;

const ScrollableList = styled(ScrollboxVertical)`
  background: linear-gradient(${userListBg} 30%, rgba(255,255,255,0)),
    linear-gradient(rgba(255,255,255,0), ${userListBg} 70%) 0 100%,
    /* Shadows */
    radial-gradient(farthest-side at 50% 0, rgba(0,0,0,.2), rgba(0,0,0,0)),
    radial-gradient(farthest-side at 50% 100%, rgba(0,0,0,.2), rgba(0,0,0,0)) 0 100%;

  outline: none;
  
  &:hover {
    /* Visible in Windows high-contrast themes */
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
  }

  &:focus,
  &:active {
    border-radius: none;
    box-shadow: inset 0 0 1px ${colorPrimary};
    outline-style: transparent;
  }

  overflow-x: hidden;
  padding-top: 1px;
  padding-right: 1px;
`;

const List = styled.div`
  margin: 0 0 1px ${mdPaddingY};

  [dir="rtl"] & {
    margin: 0 ${mdPaddingY} 1px 0;
  }
`;

const ListItem = styled(Styled.ListItem)`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-flow: row;
  flex-grow: 0;
  flex-shrink: 0;
  padding-top: ${lgPaddingY};
  padding-bottom: ${lgPaddingY};
  padding-left: ${lgPaddingY};
  text-decoration: none;
  width: 100%;
  color: ${colorGrayDark};
  background-color: ${colorOffWhite};

  [dir="rtl"]  & {
    padding-right: ${lgPaddingY};
    padding-left: 0;
  }

  > i {
    display: flex;
    font-size: 175%;
    color: ${colorGrayLight};
    flex: 0 0 2.2rem;
    margin-right: ${smPaddingX};
    [dir="rtl"]  & {
      margin-right: 0;
      margin-left: ${smPaddingX};
    }
  }

  > span {
    font-weight: 400;
    font-size: ${fontSizeSmall};
    color: ${colorGrayDark};
    position: relative;
    flex-grow: 1;
    line-height: 2;
    text-align: left;
    padding-left: ${lgPaddingY};
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;

    [dir="rtl"] & {
      text-align: right;
      padding-right: ${mdPaddingX};
    }
  }

  div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &:active {
    background-color: ${listItemBgHover};
    box-shadow: inset 0 0 0 ${borderSize} ${itemFocusBorder}, inset 1px 0 0 1px ${itemFocusBorder};
  }
`;

const UnreadMessages = styled(FlexColumn)`
  justify-content: center;
  margin-left: auto;
  [dir="rtl"] & {
    margin-right: auto;
    margin-left: 0;
  }
`;

const UnreadMessagesText = styled(FlexColumn)`
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

const Separator = styled.hr`
  margin: 1rem auto;
  width: 2.2rem;
  border: 0;
  border-top: 1px solid ${colorGrayLighter};
`;

export default {
  Content,
  Container,
  ScrollableList,
  List,
  ListItem,
  UnreadMessages,
  UnreadMessagesText,
  Separator,
};
