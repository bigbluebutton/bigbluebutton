import styled from 'styled-components';
import { colorText } from '/imports/ui/stylesheets/styled-components/palette';

export const ChatMessage = styled.div`
  flex: 1;
  display: flex;
  flex-flow: row;
  color: ${colorText};
  word-break: break-word;
  ${({ emphasizedMessage }) =>
    emphasizedMessage &&
    `
    font-weight: bold;
  `}
`;

export default {
  ChatMessage,
};
