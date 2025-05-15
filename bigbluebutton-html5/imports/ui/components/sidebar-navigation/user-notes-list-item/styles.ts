import styled from 'styled-components';
import Styled from '../styles';
import { colorGray, colorGrayLightest } from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeSmaller,
  fontSizeXS,
} from '/imports/ui/stylesheets/styled-components/typography';

const UnreadMessages = styled.div``;

const UnreadMessagesText = styled.div``;

interface ListItemProps {
  $disabled?: boolean;
}

const ListItem = styled(Styled.ListItem)<ListItemProps>`
  ${({ $disabled }) => $disabled && `
    cursor: not-allowed;
    border: none;
    background-color: ${colorGrayLightest};
  `}
`;

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
  ListItem,
  NotesLock,
};
