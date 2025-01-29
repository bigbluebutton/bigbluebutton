import styled from 'styled-components';
import { HeaderContainer as BaseHeaderContainer } from '/imports/ui/components/sidebar-content/styles';
import ChatActions from './chat-actions/component';

export const HeaderContainer = styled(BaseHeaderContainer)``;

export const ChatActionsContainer = styled(ChatActions)`
  margin: auto .5rem;
  border: 2px solid red;
`;

export default {
  HeaderContainer,
  ChatActionsContainer,
};
