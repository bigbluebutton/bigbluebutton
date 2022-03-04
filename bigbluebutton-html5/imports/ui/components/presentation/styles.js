import styled from 'styled-components';
import {
  innerToastWidth,
  toastIconSide,
  smPaddingX,
  smPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorPrimary,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeLarger,
} from '/imports/ui/stylesheets/styled-components/typography';
import FullscreenButtonContainer from '/imports/ui/components/common/fullscreen-button/container';
import ToastStyled from '/imports/ui/components/common/toast/styles';

const VisuallyHidden = styled.span`
  position: absolute;
  overflow: hidden;
  clip: rect(0 0 0 0);
  height: 1px; width: 1px;
  margin: -1px; padding: 0; border: 0;
`;

const PresentationSvg = styled.svg`
  object-fit: contain;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;

  //always show an arrow by default
  cursor: default;

  //double click on the whiteboard shouldn't change the cursor
  -moz-user-select: -moz-none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const PresentationFullscreenButton = styled(FullscreenButtonContainer)`
  z-index: 1;
  position: absolute;
  top: 0;
  right: 0;
  left: auto;
  cursor: pointer;

  [dir="rtl"] & {
    right: auto;
    left : 0;
  }
`;

const InnerToastWrapper = styled.div`
  width: ${innerToastWidth};
`;

const ToastIcon = styled.div`
  margin-right: ${smPaddingX};
  [dir="rtl"] & {
    margin-right: 0;
    margin-left: ${smPaddingX};
  }
`;

const IconWrapper = styled.div`
  background-color: ${colorPrimary};
  width: ${toastIconSide};
  height: ${toastIconSide};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  & > i {
    position: relative;
    color: ${colorWhite};
    font-size: ${fontSizeLarger};
  }
`;

const ToastTextContent = styled.div`
  position: relative;
  overflow: hidden;
  margin-top: ${smPaddingY};

  & > div:first-of-type {
    font-weight: bold;
  }
`;

const PresentationName = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
`;

const ToastDownload = styled.span`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  a {
    color: ${colorPrimary};
    cursor: pointer;
    text-decoration: none;

    &:focus,
    &:hover,
    &:active {
      color: ${colorPrimary};
      box-shadow: 0;
    }
  }
`;

const PresentationContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const Presentation = styled.div`
  order: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
`;

const SvgContainer = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const WhiteboardSizeAvailable = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: -1;
`;

const PresentationToolbar = styled.div`
  display: flex;
  overflow-x: visible;
  order: 2;
  position: absolute;
  bottom: 0;
`;

const ToastSeparator = styled(ToastStyled.Separator)``;

export default {
  VisuallyHidden,
  PresentationSvg,
  PresentationFullscreenButton,
  InnerToastWrapper,
  ToastIcon,
  IconWrapper,
  ToastTextContent,
  PresentationName,
  ToastDownload,
  PresentationContainer,
  Presentation,
  SvgContainer,
  WhiteboardSizeAvailable,
  PresentationToolbar,
  ToastSeparator,
};
