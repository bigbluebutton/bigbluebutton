import styled from 'styled-components';
import {
  colorWhite,
  colorContentBackground,
} from '/imports/ui/stylesheets/styled-components/palette';
import SpinnerStyles from '/imports/ui/components/common/loading-screen/styles';

const ScreenshareContainerInside = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
`;

const MainText = styled.h1`
  color: ${colorWhite};
  font-size: 1.3rem;
  font-weight: 600;
`;

const ScreenshareVideo = styled.video`
  ${({ unhealthyStream }) => unhealthyStream && `
    filter: grayscale(50%) opacity(50%);
  `}
`;

const ScreenshareContainer = styled.div`
  position: relative;
  background-color: ${colorContentBackground};
  width: 100%;
  height: 100%;

  ${({ switched }) => !switched && `
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  `}
`;

const ScreenshareContainerDefault = styled.div`
  position: absolute;
  align-items: center;
  justify-content: center;
  padding-top: 4rem;
`;

const SpinnerWrapper = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  width: 100%;
  height: 100%;
`;

const Spinner = styled(SpinnerStyles.Spinner)``;

const Bounce1 = styled(SpinnerStyles.Bounce1)``;

const Bounce2 = styled(SpinnerStyles.Bounce2)``;

const MobileControlsOverlay = styled.span`
  position: absolute;
  top:0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
`;

const HoverToolbar = styled.div`
  ${({ toolbarStyle }) => toolbarStyle === 'hoverToolbar' && `
    display: none;

    #screenshareContainer:hover > & {
      display: flex;
    }
  `}

  ${({ toolbarStyle }) => toolbarStyle === 'dontShowMobileHoverToolbar' && `
    display: none;
  `}

  ${({ toolbarStyle }) => toolbarStyle === 'showMobileHoverToolbar' && `
    display: flex;
    z-index: 2;
  `}
`;

export default {
  ScreenshareContainerInside,
  MainText,
  ScreenshareVideo,
  ScreenshareContainer,
  ScreenshareContainerDefault,
  SpinnerWrapper,
  Spinner,
  Bounce1,
  Bounce2,
  MobileControlsOverlay,
  HoverToolbar,
};
