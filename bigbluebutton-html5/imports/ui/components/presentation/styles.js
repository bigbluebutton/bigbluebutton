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
  colorGrayLightest,
  colorOffWhite,
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
  color: black;

  & > div:first-of-type {
    font-weight: bold;
    line-height: 2;
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
  // has to be 1 for showing dropdown on the popupWindow,
  //  as both presentationInnerWrapper and presentationToolbarWrapper are 'z-index: 1'.
  z-index: ${({ isPresentationDetached }) => (isPresentationDetached ? 1 : 0)};
`;

const ToastSeparator = styled(ToastStyled.Separator)``;

const Button = styled.button`
  background-color: ${colorOffWhite};
  border: none;
  border-radius: 13px;
  box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.16),
    0px 2px 3px rgba(0, 0, 0, 0.24),
    0px 2px 6px rgba(0, 0, 0, 0.1);
  color: #2d2d2d;
  cursor: pointer;
  padding: .3rem .5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  tab-index: 0;

  &:hover {
    background-color: ${colorGrayLightest};
  }
`;

const ExtraTools = styled.div`
  position: absolute;
  top: 2px;
  right: 43px;
  z-index: 399;
  display: flex;
  gap: 5px;
  height: 35px;

  [dir="rtl"] & {
    right: auto;
    left: 43px;
  }

  ${({ isToolbarVisible }) => !isToolbarVisible && `
    display: none;
  `}
`;

const IconWithMask = styled.div.attrs({
  className: 'tlui-icon',
})`
  mask: url(${({ mask }) => mask})  center 100% / 100% no-repeat;
`;

const PresenterToolContainer = styled.div`
  position: absolute;
  overflow: hidden;
  display: flex;
  align-items: stretch;
  justify-content: center;
`;

const PresenterToolSlidesColumn = styled.div`
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
`;

const PresenterToolSlidePane = styled.div`
  position: relative;

  flex: ${({ $isCurrent }) => (
    $isCurrent ? '65 1 0' : '35 1 0'
  )};

  min-width: 0;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
  ${({ $withBorder }) => $withBorder && `
    border-bottom: 1px solid #444;
  `}
`;

const PresenterToolSlideFrame = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #000;
`;

const PresenterToolSlideLabel = styled.div`
  position: absolute;
  top: 0.4rem;
  left: 0.5rem;
  z-index: 1;
  padding: 0.15rem 0.45rem;
  border-radius: 0.25rem;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 0.85rem;
`;

const PresenterToolSlideImage = styled.img`
  width: ${({ $compact }) => ($compact ? '78%' : '100%')};
  height: auto;

  max-width: ${({ $compact }) => ($compact ? '78%' : '100%')};
  max-height: ${({ $compact }) => ($compact ? '78%' : '100%')};
  object-fit: contain;
  display: block;
`;

const PresenterToolEmptySlide = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 1rem;
`;

const PresenterToolNotesPanel = styled.div`
  width: 50%;
  height: 100%;
  overflow-y: auto;
  padding: 1.5rem;
  box-sizing: border-box;
  white-space: pre-wrap;
  font-size: 1.2rem;
  line-height: 1.6;
  border-left: 1px solid #444;
  color: white;
  background: #1e1e1e;
`;

const PresenterToolSlideContent = styled.div`
  position: relative;
  flex: 1 1 0;

  width: 100%;
  min-width: 0;
  min-height: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
`;

const PresenterToolSlideViewport = styled.div`
  position: relative;

  width: 100%;
  height: auto;

  max-width: 100%;
  max-height: 100%;

  aspect-ratio: ${({ $aspectRatio }) => (
    Number.isFinite($aspectRatio) && $aspectRatio > 0
      ? $aspectRatio
      : (16 / 9)
  )};

  flex: 0 1 auto;
  overflow: hidden;
  background: #000;
`;

const PresenterToolTransformedSlide = styled.img`
  position: absolute;

  left: ${({ $leftRatio }) => `${$leftRatio * 100}%`};
  top: ${({ $topRatio }) => `${$topRatio * 100}%`};

  width: ${({ $widthRatio }) => `${$widthRatio * 100}%`};
  height: ${({ $heightRatio }) => `${$heightRatio * 100}%`};

  display: block;
  max-width: none;
  max-height: none;

  pointer-events: none;
  user-select: none;
`;

const PresenterToolCursorDot = styled.div`
  position: absolute;

  left: ${({ $leftRatio }) => `${$leftRatio * 100}%`};
  top: ${({ $topRatio }) => `${$topRatio * 100}%`};

  width: 12px;
  height: 12px;

  border-radius: 50%;
  background: #ff0000;

  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 3;
`;

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
  Button,
  ExtraTools,
  IconWithMask,
  PresenterToolContainer,
  PresenterToolSlidesColumn,
  PresenterToolSlidePane,
  PresenterToolSlideFrame,
  PresenterToolSlideLabel,
  PresenterToolSlideImage,
  PresenterToolEmptySlide,
  PresenterToolNotesPanel,
  PresenterToolSlideContent,
  PresenterToolSlideViewport,
  PresenterToolTransformedSlide,
  PresenterToolCursorDot,
};
