import styled from 'styled-components';
import { colorText, colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';

export const ChatDowloadContainer = styled.div`
  display: flex;
  flex-flow: column;
  color: ${colorText};
  word-break: break-word;
  margin-left: 2.75rem;
`;

export const ChatLink = styled.a`
  color: ${colorPrimary};
`;

export default {
  ChatDowloadContainer,
  ChatLink,
};
