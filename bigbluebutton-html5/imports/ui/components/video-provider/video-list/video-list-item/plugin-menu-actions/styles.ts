import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import {
  colorWhite,
  colorTransparent,
  colorBlack,
} from '/imports/ui/stylesheets/styled-components/palette';

const MenuWrapper = styled.div<{
  dark?: boolean;
  fullScreenEnabled?: boolean;
}>`
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

  ${({ dark }) => `
    background-color: ${dark ? 'rgba(0,0,0,.3)' : colorTransparent};

    & button i {
      color: ${dark ? colorWhite : colorBlack};
    }
  `}
`;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - as button comes from JS, we can't provide its props
const OptionsButton = styled(Button)`
  padding: 5px;
  transform: rotate(90deg);

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
  MenuWrapper,
  OptionsButton,
};
