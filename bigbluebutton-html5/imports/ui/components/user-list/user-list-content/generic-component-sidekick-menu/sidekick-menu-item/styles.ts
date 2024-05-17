import styled from 'styled-components';

import StyledContent from '/imports/ui/components/user-list/user-list-content/styles';

const ListItem = styled(StyledContent.ListItem)`
  i{ left: 4px; }
`;

const MenuItemsWrapper = styled.div`
  flex-grow: 0;
  display: flex;
  flex-flow: column;
  flex-shrink: 0;
  max-height: 30vh;
`;

const ScrollableList = styled(StyledContent.ScrollableList)``;

const List = styled(StyledContent.List)``;

export default {
  ListItem,
  MenuItemsWrapper,
  ScrollableList,
  List,
};
