import styled from 'styled-components';

import Button from '/imports/ui/components/common/button/component';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import StyledContent from '/imports/ui/components/user-list/user-list-content/styles';

const OptionsButton = styled(Button)`
  border-radius: 50%;
  display: block;
  padding: 0;
  margin: 0 0.25rem;

  span {
    padding: inherit;
  }

  i {
    font-size: ${fontSizeBase} !important;
  }
`;

const ScrollableList = styled(StyledContent.ScrollableList)``;

const List = styled(StyledContent.List)``;

const ListItem = styled(StyledContent.ListItem)``;

export default {
  OptionsButton,
  ScrollableList,
  List,
  ListItem,
};
