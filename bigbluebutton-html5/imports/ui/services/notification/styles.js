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

export default { HelpLinkButton };
