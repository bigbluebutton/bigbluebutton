import styled from 'styled-components';
import { ToastContainer as Toastify } from 'react-toastify';
import Icon from '/imports/ui/components/common/icon/component';
import {
  fontSizeSmallest,
  fontSizeSmaller,
  fontSizeSmall,
  lineHeightComputed,
} from '/imports/ui/stylesheets/styled-components/typography';
import {
  colorGrayDark,
  toastDefaultColor,
  toastDefaultBg,
  toastInfoColor,
  toastInfoBg,
  toastSuccessColor,
  toastSuccessBg,
  toastErrorColor,
  toastErrorBg,
  toastWarningColor,
  toastWarningBg,
  colorGrayLighter,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  toastOffsetSm,
  smPaddingX,
  borderSizeSmall,
  toastIconMd,
  toastIconSm,
  jumboPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const CloseIcon = styled(Icon)`
  background: transparent;
  outline: none;
  border: none;
  cursor: pointer;
  opacity: .5;
  font-size: ${fontSizeSmallest};
  color: ${colorGrayDark};
  line-height: 0;
  position: relative;
  font-size: 70%;
  left: ${toastOffsetSm};
  
  [dir="rtl"] & {
    left: auto;
    right: ${toastOffsetSm};
  }

  ${({ animations }) => animations && `
    transition: .3s ease;
  `}

  &:before {
    margin: inherit inherit inherit -.4rem;

    [dir="rtl"] & {
      margin: inherit -.4rem inherit inherit;
    }
  }

  &:hover,
  &:focus {
    opacity: 1;
  }

  @media ${smallOnly} {
    position: relative;
    font-size: ${fontSizeSmaller};
    left: auto;
  }
`;

const ToastContainer = styled.div`
  display: flex;
  flex-direction: column;

  ${({ small }) => small && `
    background-color: inherit;
  `}
`;

const ToastIcon = styled.div`
  align-self: flex-start;
  margin: 0 ${smPaddingX} auto 0;
  width: ${toastIconMd};
  height: ${toastIconMd};
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;

  [dir="rtl"]  & {
    margin: 0 0 auto ${smPaddingX};
  }

  & > i {
    line-height: 0;
    color: inherit;
    position: absolute;
    top: 50%;
    width: 100%;
  }

  ${({ small }) => small && `
    width: ${toastIconSm};
    height: ${toastIconSm};
    & > i {
      font-size: 70%;
    }
  `}
`;

const ToastMessage = styled.div`
  margin-top: auto;
  margin-bottom: auto;
  font-size: ${fontSizeSmall};
  max-height: 15vh;
  overflow: auto;

  ${({ small }) => small && `
    font-size: 80%;
  `}
`;

const BackgroundColorInherit = styled.div`
  position: relative;
`;

const Separator = styled.div`
  position: relative;
  width: 100%;
  height: ${borderSizeSmall};
  background-color: ${colorGrayLighter};
  margin-top: calc(${lineHeightComputed} * .5);
  margin-bottom: calc(${lineHeightComputed} * .5);
`;

const Toast = styled.div`
  display: flex;

  ${({ type }) => type === 'default' && `
    & .toastIcon {
      color: ${toastDefaultColor};
      background-color: ${toastDefaultBg};
    }
  `}

  ${({ type }) => type === 'error' && `
    & .toastIcon {
      color: ${toastErrorColor};
      background-color: ${toastErrorBg};
    }
  `}

  ${({ type }) => type === 'info' && `
    & .toastIcon {
      color: ${toastInfoColor};
      background-color: ${toastInfoBg};
    }
  `}

  ${({ type }) => type === 'success' && `
    & .toastIcon {
      color: ${toastSuccessColor};
      background-color: ${toastSuccessBg};
    }
  `}

  ${({ type }) => type === 'warning' && `
    & .toastIcon {
      color: ${toastWarningColor};
      background-color: ${toastWarningBg};
    }
  `}
`;

const ToastifyContainer = styled(Toastify)`
  z-index: 9998;
  position: fixed;
  min-width: 20rem !important;
  max-width: 23rem !important;
  box-sizing: border-box;
  right: ${jumboPaddingY};
  left: auto;
  top: 4.5rem;
  max-height: 75vh;
  overflow: hidden;

  [dir="rtl"] & {
    right: auto;
    left: ${jumboPaddingY};
  }

  @media ${smallOnly} {
    width: 75%;
  }
`;

export default {
  CloseIcon,
  ToastContainer,
  ToastIcon,
  ToastMessage,
  BackgroundColorInherit,
  Separator,
  Toast,
  ToastifyContainer,
};
