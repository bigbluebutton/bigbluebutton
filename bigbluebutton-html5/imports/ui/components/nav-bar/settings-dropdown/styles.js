import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Button from '/imports/ui/components/common/button/component';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

const DropdownButton = styled(Button)`
  ${({ state }) => state === 'open' && `
    @media ${smallOnly} {
      display: none;
    }
  `}

  ${({ state }) => state === 'closed' && `
    margin: 0;

    & span {
      border: none;
      box-shadow: none;
    }

    z-index: 3;

    &:hover,
    &:focus {
      span {
        background-color: transparent !important;
        color: ${colorWhite} !important;
        opacity: .75;
      }
    }
  `}
`;

export default {
  DropdownButton,
};
