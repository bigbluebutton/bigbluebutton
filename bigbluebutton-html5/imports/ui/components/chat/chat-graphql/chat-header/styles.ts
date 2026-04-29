import styled from 'styled-components';
import { HeaderContainer as BaseHeaderContainer } from '/imports/ui/components/sidebar-content/styles';
import ChatActions from './chat-actions/component';
import { colorNeutral2 } from '/imports/ui/stylesheets/styled-components/palette';
import OrTrigger from '/imports/ui/components/common/control-header/right/component';

export const HeaderContainer = styled(BaseHeaderContainer)``;

export const ChatActionsContainer = styled(ChatActions)`
  margin: auto .5rem;
  border: 2px solid red;
`;

export const Trigger = styled(OrTrigger)`
  color: ${colorNeutral2};
`;

export default {
  HeaderContainer,
  ChatActionsContainer,
  Trigger,
};
