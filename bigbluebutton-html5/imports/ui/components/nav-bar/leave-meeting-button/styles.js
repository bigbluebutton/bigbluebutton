import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Button from '/imports/ui/components/common/button/component';

const LeaveMeetingWrapper = styled.div`
  display: inline-block;
  
  /* Margins moved here from LeaveButton to fix clickable area issue */
  /* Only apply margins on non-mobile to match original button behavior */
  ${({ $isMobile }) => !$isMobile && `
    margin-left: 1.0rem;
    margin-right: 0.5rem;
  `}
`;

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
    z-index: 3;
  `}
`;

export default {
  LeaveMeetingWrapper,
  LeaveButton,
};
