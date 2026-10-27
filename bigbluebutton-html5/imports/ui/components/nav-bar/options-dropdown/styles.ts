import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Button from '/imports/ui/components/common/button/component';
import { mobileNavbarButtonGap, mobileNavbarButtonSize } from '/imports/ui/stylesheets/styled-components/general';
import { activeEntryBadge } from '/imports/ui/components/common/bar-overflow/styles';

// @ts-ignore - JS code
const DropdownButton = styled(Button)<{
  state?: 'open' | 'closed';
  $hasActiveEntry?: boolean;
}>`
  ${({ state }) => state === 'open' && `
    @media ${smallOnly} {
      display: none;
    }
  `}

  ${({ state }) => state === 'closed' && `
    margin: 0;
    z-index: 3;
  `}

  /* The other nav bar buttons are spaced by their wrappers' margins; this one has no wrapper. */
  margin-inline-start: ${mobileNavbarButtonGap};

  ${activeEntryBadge}

  @media ${smallOnly} {
    margin-inline-start: 0;

    & > span:first-of-type {
      width: ${mobileNavbarButtonSize};
      min-width: ${mobileNavbarButtonSize};
      height: ${mobileNavbarButtonSize};
      padding: 0 !important;
      box-sizing: border-box;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    & > span:first-of-type,
    & > span:first-of-type:hover,
    & > span:first-of-type:focus,
    & > span:first-of-type:active,
    &:hover > span:first-of-type,
    &:focus > span:first-of-type,
    &:active > span:first-of-type {
      background: transparent !important;
      background-color: transparent !important;
      box-shadow: none !important;
    }
  }
`;

export default {
  DropdownButton,
};
