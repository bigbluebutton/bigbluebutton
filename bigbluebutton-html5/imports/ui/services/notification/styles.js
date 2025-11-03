import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import {
  toastMargin,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';

const HelpLinkButton = styled(Button)`
  position: relative;
  width: 100%;
  margin-top: ${toastMargin};
  color: ${colorPrimary};
  background-color: transparent;
  
`;

const ToastWrapper = styled.div`
  width: 100%;
`;

export default { HelpLinkButton, ToastWrapper };
