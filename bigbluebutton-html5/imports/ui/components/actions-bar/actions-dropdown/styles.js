import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Button from '/imports/ui/components/button/component';

const HideDropdownButton = styled(Button)`
  ${({ open }) => open && `
      @media ${smallOnly} {
        display:none;
      }
   `}
`;

export default {
  HideDropdownButton,
};
