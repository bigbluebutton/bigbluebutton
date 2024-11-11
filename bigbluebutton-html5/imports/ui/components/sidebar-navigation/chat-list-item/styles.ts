import styled from 'styled-components';
import {
  colorWhite,
  unreadMessagesBg,
} from '/imports/ui/stylesheets/styled-components/palette';
import Styled from '../styles';
import { ListItemProps } from '../types';

const UnreadMessages = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;
  margin-left: auto;
  [dir="rtl"] & {
    margin-right: auto;
    margin-left: 0;
  }
`;

const UnreadMessagesText = styled.div`
  display: flex;
  flex-flow: column;
  margin: 0;
  justify-content: center;
  color: ${colorWhite};
  line-height: calc(1rem + 1px);
  padding: 0 0.5rem;
  text-align: center;
  border-radius: 0.5rem/50%;
  font-size: 0.8rem;
  background-color: ${unreadMessagesBg};
`;

const ListItem = styled(Styled.ListItem)<ListItemProps>``;

export default {
  UnreadMessages,
  UnreadMessagesText,
  ListItem,
};
