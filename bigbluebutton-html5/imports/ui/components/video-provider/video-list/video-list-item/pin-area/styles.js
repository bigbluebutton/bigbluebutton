import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { colorTransparent, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

const PinButton = styled(Button)`
  padding: 5px;
  &,
  &:active,
  &:hover,
  &:focus {
    background-color: ${colorTransparent} !important;
    border: none !important;

    & > i {
      border: none !important;
      color: ${colorWhite};
      font-size: 1rem;
      background-color: ${colorTransparent} !important;
    }
  }
`;

const PinButtonWrapper = styled.div`
  background-color: rgba(0,0,0,.3);
  cursor: pointer;
  border: 0;
  margin: 2px;
  height: fit-content;

  [dir="rtl"] & {
    right: auto;
    left :0;
  }

  [class*="presentationZoomControls"] & {
    position: relative !important;
  }
`;

export default {
  PinButtonWrapper,
  PinButton,
};
