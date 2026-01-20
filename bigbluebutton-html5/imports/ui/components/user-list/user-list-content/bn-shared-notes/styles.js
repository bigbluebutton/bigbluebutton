import styled from 'styled-components';

import Styled from '/imports/ui/components/user-list/styles';
import StyledContent from '/imports/ui/components/user-list/user-list-content/styles';
import { colorGray } from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeSmall,
  fontSizeSmaller,
  fontSizeXS,
} from '/imports/ui/stylesheets/styled-components/typography';

const Messages = styled(Styled.Messages)``;

const ScrollableList = styled(StyledContent.ScrollableList)``;

const List = styled(StyledContent.List)``;

const ListItem = styled(StyledContent.ListItem)``;

const BlockNoteTitle = styled.div`
  font-size: ${fontSizeSmall};
`;

const NotesLock = styled.div`
  font-weight: 200;
  font-size: ${fontSizeSmaller};
  color: ${colorGray};

  > span i {
    font-size: ${fontSizeXS};
    left: 0;
  }
`;

export default {
  Messages,
  ScrollableList,
  List,
  ListItem,
  NotesLock,
  BlockNoteTitle,
};
