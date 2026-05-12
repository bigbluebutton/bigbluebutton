import styled from 'styled-components';
import ChatActions from './chat-actions/component';
import { colorNeutral2 } from '/imports/ui/stylesheets/styled-components/palette';
import OrTrigger from '/imports/ui/components/common/control-header/right/component';

export const ChatActionsContainer = styled(ChatActions)`
  margin: auto .5rem;
`;

export const Trigger = styled(OrTrigger)`
  color: ${colorNeutral2};
`;

export default {
  ChatActionsContainer,
  Trigger,
};
