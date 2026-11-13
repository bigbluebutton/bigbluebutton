// Shared by request-unmute-modal and request-camera-modal.
import styled from 'styled-components';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
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

const FooterButton = styled(BBButton)`
  @media ${smallOnly} {
    flex: 1;

    i {
      display: none;
    }
  }
`;

export default {
  Subtitle,
  FooterButton,
};
