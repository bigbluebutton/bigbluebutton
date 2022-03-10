import styled from 'styled-components';

import Styled from '/imports/ui/components/user-list/styles';
import StyledContent from '/imports/ui/components/user-list/user-list-content/styles';
import { colorGray } from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';

const Messages = styled(Styled.Messages)``;

const Container = styled(StyledContent.Container)``;

const SmallTitle = styled(Styled.SmallTitle)``;

const ScrollableList = styled(StyledContent.ScrollableList)``;

const List = styled(StyledContent.List)``;

const ListItem = styled(StyledContent.ListItem)``;

const BreakoutTitle = styled.div`
  font-size: ${fontSizeSmall};
`;

const BreakoutDuration = styled.p`
  margin: 0;
  font-size: 0.75rem;
  font-weight: 200;
  color: ${colorGray};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: italic;
`;

export default {
  Messages,
  Container,
  SmallTitle,
  ScrollableList,
  List,
  ListItem,
  BreakoutTitle,
  BreakoutDuration,
};
