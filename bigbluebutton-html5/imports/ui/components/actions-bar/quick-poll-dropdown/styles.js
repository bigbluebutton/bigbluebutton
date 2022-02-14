import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { colorOffWhite, toolbarButtonColor } from '/imports/ui/stylesheets/styled-components/palette';
import { whiteboardToolbarPadding, borderSizeLarge } from '/imports/ui/stylesheets/styled-components/general';
import { headingsFontWeight } from '/imports/ui/stylesheets/styled-components/typography';

const QuickPollButton = styled(Button)`
  padding: ${whiteboardToolbarPadding};
  background-color: ${colorOffWhite} !important;
  box-shadow: none !important;

  & > span:first-child {
    border: 1px solid ${toolbarButtonColor};
    border-radius: ${borderSizeLarge};
    color: ${toolbarButtonColor};
    font-size: small;
    font-weight: ${headingsFontWeight};
    opacity: 1;
    padding-right: ${borderSizeLarge};
    padding-left: ${borderSizeLarge};
  }

  & > span:first-child:hover {
    opacity: 1 !important;
  }
`;

export default {
  QuickPollButton,
};
