import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

const RestorePresentationButton = styled(Button)`
  ${({ ghost }) => ghost && `
      span {
        box-shadow: none;
        background-color: transparent !important;
        border-color: ${colorWhite} !important;
      }
   `}
`;

export default {
  RestorePresentationButton,
};
