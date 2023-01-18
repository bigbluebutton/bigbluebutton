import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import {
  colorWhite,
  colorBlack,
  colorTransparent,
} from '/imports/ui/stylesheets/styled-components/palette';

const PipButton = styled(Button)`
  display: flex;
  padding: 5px;

  &,
  &:active,
  &:hover,
  &:focus {
    border: none !important;
    background-color: ${colorTransparent} !important;

    i {
      border: none !important;
      background-color: ${colorTransparent} !important;
    }
  }

  i {
    font-size: 1rem;
  }
`;

const Wrapper = styled.div`
  position: absolute;
  right: 2rem;
  left: auto;
  background-color: ${colorTransparent};
  cursor: pointer;
  border: 0;
  z-index: 2;
  margin: 2px;

  [dir="rtl"] & {
    right: auto;
    left: 2rem;
  }

  ${({ dark }) => dark && `
    background-color: rgba(0, 0, 0, .3);
    i {
      color: ${colorWhite};
    }
  `}

  ${({ light }) => light && `
    background-color: ${colorTransparent};
    i {
      color: ${colorBlack};
    }
  `}

  ${({ bottom }) => bottom && `
    bottom: 0;
  `}

  ${({ top }) => top && `
    top: 0;
  `}

  ${({ right }) => right && `
    right: 0;
    [dir="rtl"] & {
      right: auto;
      left: 0;
    }
  `}
`;

export default {
  PipButton,
  Wrapper,
};
