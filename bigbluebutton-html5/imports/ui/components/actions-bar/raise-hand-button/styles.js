import styled from 'styled-components';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';

const RaiseHandButton = styled(Button)`
${({ ghost }) => ghost && `
  & > span {
    box-shadow: none;
    background-color: transparent !important;
    border-color: ${colorWhite} !important;
  }
   `}
   
   & span i {
    left: -.05rem;
   }
`;

export default {
  RaiseHandButton,
};
