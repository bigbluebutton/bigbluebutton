import styled from 'styled-components';

import Styled from '/imports/ui/components/user-list/styles';
import StyledContent from '/imports/ui/components/user-list/user-list-content/styles';

const Messages = styled(Styled.Messages)``;

const Container = styled(StyledContent.Container)``;

const SmallTitle = styled(Styled.SmallTitle)``;

const ScrollableList = styled(StyledContent.ScrollableList)``;

const List = styled(StyledContent.List)``;

const ListItem = styled(StyledContent.ListItem)``;

const UnreadMessages = styled(StyledContent.UnreadMessages)``;

const UnreadMessagesText = styled(StyledContent.UnreadMessagesText)``;

export default {
  Messages,
  Container,
  SmallTitle,
  ScrollableList,
  List,
  ListItem,
  UnreadMessages,
  UnreadMessagesText,
};
