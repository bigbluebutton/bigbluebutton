import styled from 'styled-components';
import { colorWhite, colorGrayDark, colorOffWhite, listItemBgHover, itemFocusBorder, unreadMessagesBg } from '/imports/ui/stylesheets/styled-components/palette';
import { lgPaddingY, borderSize, smPaddingY } from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';
import UserStyles from '/imports/ui/components/user-list/styles';

const QuestionsListItem = styled(UserStyles.ListItem)`
  cursor: pointer;
  text-decoration: none;
  flex-grow: 1;
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

const QuestionsListItemLink = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  text-decoration: none;
  width: 100%;
`;

const QuestionsIcon = styled.div`
  flex: 0 0 2.2rem;
`;

const QuestionsName = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  justify-content: center;
  width: 50%;
  padding-right: ${smPaddingY};
`;

const QuestionsNameMain = styled.div`
  margin: 0;
  min-width: 0;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  font-weight: 400;
  font-size: ${fontSizeSmall};
  color: ${colorGrayDark};
  flex-grow: 1;
  text-align: left;
  padding: 0 0 0 ${lgPaddingY};
  text-overflow: ellipsis;

  [dir="rtl"] & {
    text-align: right;
    padding: 0 ${lgPaddingY} 0 0;
  }
`;

const Active = styled.div`
  background-color: ${listItemBgHover};
  box-shadow: inset 0 0 0 var(--border-size) ${itemFocusBorder}, inset 1px 0 0 1px ${itemFocusBorder};
`;

const Unread = styled.div`
  justify-content: center;
`;

const UnreadNotification = styled.div`
  justify-content: center;
  color: ${colorWhite};
  line-height: calc(1rem + 1px);
  padding: 0 0.5rem;
  text-align: center;
  border-radius: 0.5rem/50%;
  font-size: 0.8rem;
  background-color: ${unreadMessagesBg};
`;

export default {
  QuestionsListItem,
  QuestionsListItemLink,
  QuestionsIcon,
  QuestionsName,
  QuestionsNameMain,
  Active,
  Unread,
  UnreadNotification,
};
