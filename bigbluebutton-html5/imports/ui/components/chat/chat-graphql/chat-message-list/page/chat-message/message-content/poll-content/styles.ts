import styled from 'styled-components';
import { colorText } from '/imports/ui/stylesheets/styled-components/palette';

export const PollText = styled.div`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  font-weight: 500;
  color: ${colorText};
  word-break: break-word;
`;

export const PollWrapper = styled.div`
  width: 100%;
`;

export default {
  PollText,
  PollWrapper,
};
