import styled from 'styled-components';
import { colorText } from '/imports/ui/stylesheets/styled-components/palette';

export const pollText = styled.div`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  font-weight: 500;
  margin-left: 2.75rem;
  color: ${colorText};
  word-break: break-word;
`;

export default {
  pollText,
};
