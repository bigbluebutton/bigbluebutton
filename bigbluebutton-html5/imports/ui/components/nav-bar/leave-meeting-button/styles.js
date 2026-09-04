import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Button from '/imports/ui/components/common/button/component';
import { mobileNavbarButtonSize } from '/imports/ui/stylesheets/styled-components/general';

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

  ${({ state }) => state === 'closed' && `
    z-index: 3;
    display: flex;
  `}

  @media ${smallOnly} {
    width: ${mobileNavbarButtonSize};
    height: ${mobileNavbarButtonSize};
    min-width: ${mobileNavbarButtonSize};
    padding: 0 !important;
    border-radius: 50% !important;
    font-size: 1rem;
    align-items: center;
    justify-content: center;

    & > span {
      display: none !important;
    }
  }
`;

const LeaveButtonWrapper = styled.div`
  margin: 0px 0.5rem;

  @media ${smallOnly} {
    padding-left: 0.3rem;
  }
`;

export default {
  LeaveButton,
  LeaveButtonWrapper,
};
