import styled from 'styled-components';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import { confirmationButtonMinWidth } from '/imports/ui/stylesheets/styled-components/general';
import {
  titlesFontWeight,
  textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';

const Text = styled.div`
  font-weight: ${titlesFontWeight};
  margin-bottom: 0.25rem;
`;

const IgnoreText = styled.div`
  font-weight: ${textFontWeight};
`;

const FooterButton = styled(BBButton)`
  min-width: ${confirmationButtonMinWidth};
`;

export default {
  Text,
  IgnoreText,
  FooterButton,
};
