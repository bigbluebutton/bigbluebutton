import styled from 'styled-components';
import { colorText, colorBorder } from '/imports/ui/stylesheets/styled-components/palette';

export const ChatOfflineIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  position: relative;
  margin-top: 0.2rem;
  padding: 0.5rem;
  border-radius: 2px;
  border-top: 1px solid ${colorBorder};
  & > span {
    color: ${colorText};
    font-size: 1rem;
  }
`;

export default {
  ChatOfflineIndicator,
};
