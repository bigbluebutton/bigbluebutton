import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Button from '/imports/ui/components/common/button/component';

const LeaveButton = styled(Button)`
  border-radius: 1.1rem;
  font-size: 1rem;
  line-height: 1.1rem;
  font-weight: 400;

  ${({ state }) => state === 'open' && `
    @media ${smallOnly} {
      display: none;
    }
  `}

  ${({ state }) => state === 'closed' && `
  @media ${smallOnly} {
    margin-left: 0;
    margin-right: 0;
  }
`}

  ${({ isMobile }) => !isMobile && `
    margin-left: 1.0rem;
    margin-right: 0.5rem;
  `}

  ${({ state }) => state === 'closed' && `
    z-index: 3;
  `}
`;

export default {
  LeaveButton,
};
