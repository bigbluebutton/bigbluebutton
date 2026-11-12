// Shared by request-unmute-modal and request-camera-modal.
import styled from 'styled-components';
import {
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const Subtitle = styled.p`
  display: block;
  text-align: start;
  font-size: 1rem;
  margin: 0;
  color: ${colorText};
`;

const Footer = styled.div`
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;

  @media ${smallOnly} {
    button {
      flex: 1;

      i {
        display: none;
      }
    }
  }
`;

export default {
  Subtitle,
  Footer,
};
