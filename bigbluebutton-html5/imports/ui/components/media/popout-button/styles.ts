import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import {
  colorTransparent,
  colorWhite,
  colorBlack,
} from '/imports/ui/stylesheets/styled-components/palette';

const PopOutButtonWrapper = styled.div<{
  theme: string;
  position: string;
  fullScreenEnabled: boolean;
}>`
  position: absolute;
  right: 0;
  ${({ fullScreenEnabled }) => fullScreenEnabled && `
    right: 1.75rem;
  `}
  left: auto;
  background-color: ${colorTransparent};
  cursor: pointer;
  border: 0;
  z-index: 2;
  margin: 2px;

  [dir="rtl"] & {
    right: auto;
    left: 0;
    ${({ fullScreenEnabled }) => fullScreenEnabled && `
      left: 1.75rem;
    `}
  }

  [class*="presentationZoomControls"] & {
    position: relative !important;
  }

  ${({ theme }) => theme === 'dark' && `
    background-color: rgba(0,0,0,.3);

    & button i {
      color: ${colorWhite};
    }
  `}

  ${({ theme }) => theme === 'light' && `
    background-color: ${colorTransparent};

    & button i {
      color: ${colorBlack};
    }
  `}

  ${({ position }) => position === 'bottom' && `
    bottom: 0;
  `}

  ${({ position }) => position === 'top' && `
    top: 0;
  `}
`;

// @ts-ignore - as button comes from JS, we can't provide its props
const PopOutButton = styled(Button) <{
  isStyled: boolean;
}>`
  ${({ isStyled }) => isStyled && `
    &,
    &:active,
    &:hover,
    &:focus {
      background-color: ${colorTransparent} !important;
      border: none !important;

      i {
        border: none !important;
        background-color: ${colorTransparent} !important;
      }
    }
    padding: 5px;

    &:hover {
      border: 0;
    }

    i {
      font-size: 1rem;
    }
  `}
`;

export default {
  PopOutButtonWrapper,
  PopOutButton,
};
