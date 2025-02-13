import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Button from '/imports/ui/components/common/button/component';

const LeaveButton = styled(Button)`
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

  ${({ state, isMobile }) => state === 'closed' && !isMobile && `
    margin-right: 0.5rem;
  `}

  ${({ state }) => state === 'closed' && `
    border-radius: 1.1rem;
    font-size: 1rem;
    line-height: 1.1rem;
    font-weight: 400;
    z-index: 3;
  `}
`;
const LeaveButtonWrapper = styled.div`
  padding-left: 0.5rem;

  @media ${smallOnly} {
    padding-left: 0.3rem;
  }
`;

export default {
  LeaveButton,
  LeaveButtonWrapper,
};
