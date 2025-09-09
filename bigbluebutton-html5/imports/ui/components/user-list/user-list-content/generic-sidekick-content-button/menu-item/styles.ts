import styled from 'styled-components';

import StyledContent from '../../styles';

import StyledContainer from '../styles';

const GenericContentBadge = styled(StyledContent.UnreadMessages)``;

const GenericContentBadgeText = styled(StyledContent.UnreadMessagesText)``;

const ScrollableList = styled(StyledContainer.ScrollableList)``;

const ListItem = styled(StyledContainer.ListItem)``;

const List = styled(StyledContainer.List)``;

export default {
  GenericContentBadge,
  GenericContentBadgeText,
  ScrollableList,
  ListItem,
  List,
};
