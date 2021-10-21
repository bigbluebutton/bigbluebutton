import styled from 'styled-components';

import Styled from '/imports/ui/components/user-list/styles';
import StyledContent from '/imports/ui/components/user-list/user-list-content/styles';
import { FlexColumn } from '/imports/ui/stylesheets/styled-components/placeholders';
import {
  unreadMessagesBg,
  colorWhite,
  colorOffWhite,
  colorGray,
  colorGrayDark,
  colorGrayLight,
  listItemBgHover,
  itemFocusBorder,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  lgPaddingY,
  smPaddingX,
  mdPaddingX,
  borderSize,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeSmall,
  fontSizeSmaller,
  fontSizeXS,
} from '/imports/ui/stylesheets/styled-components/typography';

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

const NoteTitle = styled.div`
  font-weight: 400;
  font-size: ${fontSizeSmall};
`;

const NoteLock = styled.div`
  font-weight: 200;
  font-size: ${fontSizeSmaller};
  color: ${colorGray};

  > i {
    font-size: ${fontSizeXS};
  }
`;

const Messages = styled(Styled.Messages)``;

const Container = styled(StyledContent.Container)``;

const SmallTitle = styled(Styled.SmallTitle)``;

const ScrollableList = styled(StyledContent.ScrollableList)``;

const List = styled(StyledContent.List)``;

export default {
  UnreadMessages,
  UnreadMessagesText,
  ListItem,
  NoteTitle,
  NoteLock,
  Messages,
  Container,
  SmallTitle,
  ScrollableList,
  List,
};
