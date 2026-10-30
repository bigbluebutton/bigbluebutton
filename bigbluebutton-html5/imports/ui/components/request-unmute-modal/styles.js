import styled from 'styled-components';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import {
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  $2xlPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const Subtitle = styled.p`
  display: block;
  text-align: left;
  font-size: 1rem;
  padding: 0rem 1rem;
  padding-bottom: 1.5rem;
  margin-top: 0rem;
  color: ${colorText};

  @media ${smallOnly} {
    margin-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
`;

const RequestModalContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${$2xlPadding};
  margin-top: 1rem;
  padding: 1rem;

  @media ${smallOnly} {
    flex-direction: row-reverse;
    gap: 1rem;
    margin-top: 0;
    padding: 0;
  }
`;

// On a phone the pair shares the row equally (the component drops the icons there).
const RequestButton = styled(BBButton)`
  @media ${smallOnly} {
    flex: 1;
  }
`;

export default {
  Subtitle,
  RequestModalContent,
  RequestButton,
};
