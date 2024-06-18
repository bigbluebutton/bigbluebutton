import styled from 'styled-components';

import Styled from '/imports/ui/components/user-list/styles';
import StyledContent from '/imports/ui/components/user-list/user-list-content/styles';

interface ListItemProps {
  active: boolean;
}

const ListItem = styled(StyledContent.ListItem)<ListItemProps>`
  i{ left: 4px; }
`;

const Section = styled(Styled.Messages)``;

const Container = styled(StyledContent.Container)``;

const SmallTitle = styled(Styled.SmallTitle)``;

const ScrollableList = styled(StyledContent.ScrollableList)``;

const List = styled(StyledContent.List)``;

export default {
  ListItem,
  Section,
  Container,
  SmallTitle,
  ScrollableList,
  List,
};
