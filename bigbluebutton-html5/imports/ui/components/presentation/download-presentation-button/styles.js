import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import {
  colorWhite,
  colorBlack,
  colorTransparent,
} from '/imports/ui/stylesheets/styled-components/palette';

const DownloadButton = styled(Button)`
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
`;

const ButtonWrapper = styled.div`
  position: absolute;
  right: auto;
  left: 0;
  background-color: ${colorTransparent};
  cursor: pointer;
  border: 0;
  z-index: 2;
  margin: 2px;
  bottom: 0;

  [dir="rtl"] & {
    right: 0;
    left : auto;
  }

  [class*="presentationZoomControls"] & {
    position: relative !important;
  }

  ${({ theme }) => theme === 'dark' && `
    background-color: rgba(0,0,0,.3) !important;

    & > button i {
      color: ${colorWhite} !important;
    }
  `}

  ${({ theme }) => theme === 'light' && `
    background-color: ${colorTransparent} !important;

    & > button i {
      color: ${colorBlack} !important;
    }
  `}
`;

export default {
  DownloadButton,
  ButtonWrapper,
};
