import styled from 'styled-components';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import { confirmationButtonMinWidth } from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeLarge } from '/imports/ui/stylesheets/styled-components/typography';

const ActivityModalContent = styled.div`
  flex-direction: column;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  padding: 0;
  margin-top: auto;
  margin-bottom: auto;
  padding: 0.5rem;
  text-align: start;

  & > p {
    font-size: ${fontSizeLarge};
    margin: 0.5em 0;
  }
`;

const FooterButton = styled(BBButton)`
  min-width: ${confirmationButtonMinWidth};
`;

export default {
  ActivityModalContent,
  FooterButton,
};
