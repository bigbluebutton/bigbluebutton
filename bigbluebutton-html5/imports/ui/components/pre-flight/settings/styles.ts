import styled from 'styled-components';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import { colorBorder } from '/imports/ui/stylesheets/styled-components/palette';
import { jumboPaddingY } from '/imports/ui/stylesheets/styled-components/general';

const Footer = styled.div`
  display: flex;
  flex: 0 0 auto;
  gap: ${jumboPaddingY};
  padding: ${jumboPaddingY};
  border-top: 1px solid ${colorBorder};
`;

// An equal share of the row: the whole of it while it is the only button.
const SettingsButton = styled(BBButton)`
  flex: 1;
`;

export default {
  Footer,
  SettingsButton,
};
