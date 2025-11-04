import styled from 'styled-components';
import { colorGray } from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeSmaller,
  fontSizeXS,
} from '/imports/ui/stylesheets/styled-components/typography';

const UnreadMessages = styled.div``;

const UnreadMessagesText = styled.div``;

const NotesLock = styled.div`
  font-weight: 200;
  font-size: ${fontSizeSmaller};
  color: ${colorGray};

  > i {
    font-size: ${fontSizeXS};
  }
`;

export default {
  UnreadMessages,
  UnreadMessagesText,
  NotesLock,
};
