import styled from 'styled-components';
import {
  colorWhite,
  colorTransparent,
  colorBlack,
} from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';

const SwitchButtonWrapper = styled.div`
  position: absolute;
  right: 0;
  left: auto;
  background-color: ${colorTransparent};
  cursor: pointer;
  border: 0;
  z-index: 2;
  margin: 2px;

  [dir="rtl"] & {
    right: auto;
    left: 1.75rem;
  }

  ${({ dark }) => dark && `
    background-color: rgba(0,0,0,.3);

    & button i {
      color: ${colorWhite};
    }
  `}

  ${({ dark }) => !dark && `
    background-color: ${colorTransparent};

    & button i {
      color: ${colorBlack};
    }
  `}

  ${({ bottom }) => bottom && `
    bottom: 0;
  `}

  ${({ bottom }) => !bottom && `
    top: 0;
  `}
`;

const SwitchButton = styled(Button)`
  padding: 5px;

  &,
  &:active,
  &:hover,
  &:focus {
    background-color: ${colorTransparent} !important;
    border: none !important;

    i {
      border: none !important;
      background-color: ${colorTransparent} !important;
      font-size: 1rem;
    }
  }
`;

export default {
  SwitchButtonWrapper,
  SwitchButton,
};
