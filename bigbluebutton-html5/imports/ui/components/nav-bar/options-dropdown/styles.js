import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Button from '/imports/ui/components/common/button/component';
import {
  colorGrayDark,
  btnPrimaryColor,
  btnPrimaryActiveBg,
} from '/imports/ui/stylesheets/styled-components/palette';
import { mobileNavbarButtonSize } from '/imports/ui/stylesheets/styled-components/general';

const DropdownButton = styled(Button)`
  ${({ state }) => state === 'open' && `
    @media ${smallOnly} {
      display: none;
    }
  `}

  ${({ state }) => state === 'closed' && `
    margin: 0;
    z-index: 3;
  `}

  @media ${smallOnly} {
    & > span:first-of-type {
      width: auto;
      min-width: 0;
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

const AwayOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  & > span b {
    margin-left: 0.25rem;
    margin-right: 0.25rem;
  }
`;

const ToggleButtonWrapper = styled.div`
  border: 1px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:focus {
    background-color: ${colorGrayDark};
  }

  & > button {
    cursor: pointer;
    flex: auto;
  }

  & > * > span {
    padding: 4px;
  }

  ${({ active }) => active && `
    color: ${btnPrimaryColor};
    background-color: ${btnPrimaryActiveBg};

    &:hover{
      filter: brightness(90%);
      color: ${btnPrimaryColor};
      background-color: ${btnPrimaryActiveBg} !important;
    }
  `}

  width: auto;
  cursor: inherit;
  &:hover {
    background-color: transparent !important;
  }
`;

const AFKLabel = styled.div`
  padding-right: .5rem;
  padding-left: 0;

  [dir="rtl"] & {
    padding-left: .5rem;
    padding-right: 0;
  }

`;

export default {
  DropdownButton,
  AwayOption,
  ToggleButtonWrapper,
  AFKLabel,
};
