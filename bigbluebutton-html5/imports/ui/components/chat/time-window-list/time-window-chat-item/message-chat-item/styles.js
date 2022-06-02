import styled from 'styled-components';
import {
  colorHeading
} from '/imports/ui/stylesheets/styled-components/palette';
const PreviewModalContainer = styled.div`
  padding: 1rem;
  padding-top: 2rem; 
  padding-bottom: 0;
`
const ModalHeading = styled.h4`
  margin-top: 1rem;
  font-weight: 600;
  color: ${colorHeading};
`;

export default {
  PreviewModalContainer,
  ModalHeading
};