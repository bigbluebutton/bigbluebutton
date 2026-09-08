import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { mobileNavbarButtonSize } from '/imports/ui/stylesheets/styled-components/general';

const IconWrapper = styled.div`
  width: 1.025rem;
  height: 1.025rem;

  @media ${smallOnly} {
    width: 0.75rem;
    height: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const ButtonWrapper = styled.div`
  @media ${smallOnly} {
  margin: 0 0 0 .3rem;
}
  margin: 0 .5rem;

  @media ${smallOnly} {
    & .buttonWrapper > span:first-of-type {
      width: ${mobileNavbarButtonSize};
      height: ${mobileNavbarButtonSize};
      min-width: ${mobileNavbarButtonSize};
      padding: 0 !important;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

export default {
  IconWrapper,
  ButtonWrapper,
};
