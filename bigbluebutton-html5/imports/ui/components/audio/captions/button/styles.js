import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

const ClosedCaptionToggleButton = styled(Button)`
  ${({ ghost }) => ghost && `
    span {
      box-shadow: none;
      background-color: transparent !important;
      border-color: ${colorWhite} !important;
    }
    i {
      margin-top: .4rem;
    }
  `}
`;

export default {
  ClosedCaptionToggleButton,
};
