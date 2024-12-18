// @ts-nocheck
/* eslint-disable */
import styled, { keyframes, css } from 'styled-components';
import {
  colorPrimary,
  colorBlack,
  colorWhite,
  webcamBackgroundColor,
  colorDanger,
  webcamPlaceholderBorder,
} from '/imports/ui/stylesheets/styled-components/palette';
import { TextElipsis } from '/imports/ui/stylesheets/styled-components/placeholders';

const rotate360 = keyframes`
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
`;

const fade = keyframes`
  from {
    opacity: 0.7;
  }
  to {
    opacity: 0;
  }
`;

const Content = styled.div<{
  isStream: boolean;
  talking: boolean;
  customHighlight: boolean;
  animations: boolean;
  dragging: boolean;
  draggingOver: boolean;
  fullscreen: boolean;
}>`
  position: relative;
  display: flex;
  min-width: 100%;
  border-radius: 10px;
  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    pointer-events: none;
    border: 2px solid ${colorBlack};
    border-radius: 10px;

    ${({ isStream }) => !isStream && `
      border: 2px solid ${webcamPlaceholderBorder};
    `}

    ${({ talking }) => talking && `
      border: 2px solid ${colorPrimary};
    `}

    ${({ talking, customHighlight }) => talking && customHighlight && customHighlight.length > 0 && `
      border: 2px solid rgb(${customHighlight[0]}, ${customHighlight[1]}, ${customHighlight[2]});
    `}

    ${({ animations }) => animations && `
      transition: opacity .1s;
    `}
  }

  ${({ dragging, animations }) => dragging && animations && css`
    &::after {
      animation: ${fade} .5s linear infinite;
      animation-direction: alternate;
    }
  `}

  ${({ dragging, draggingOver }) => (dragging || draggingOver) && `
    &::after {
      opacity: 0.7;
      border-style: dashed;
      border-color: ${colorDanger};
      transition: opacity 0s;
    }
  `}

  ${({ fullscreen }) => fullscreen && `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 99;
  `}
`;

const WebcamConnecting = styled.div<{
  animations: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  min-width: 100%;
  border-radius: 10px;
  background-color: ${webcamBackgroundColor};
  z-index: 0;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    opacity: 0;
    pointer-events: none;

    ${({ animations }) => animations && `
      transition: opacity .1s;
    `}
  }
`;

const LoadingText = styled(TextElipsis)`
  color: ${colorWhite};
  font-size: 100%;
`;

const VideoContainer = styled.div<{
  $selfViewDisabled: boolean;
}>`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;

  ${({ $selfViewDisabled }) => $selfViewDisabled && 'display: none'}
`;

const Video = styled.video<{
  mirrored: boolean;
  unhealthyStream: boolean;
}>`
  position: relative;
  height: 100%;
  width: calc(100% - 1px);
  object-fit: contain;
  background-color: ${colorBlack};
  border-radius: 10px;

  ${({ mirrored }) => mirrored && `
    transform: scale(-1, 1);
  `}

  ${({ unhealthyStream }) => unhealthyStream && `
    filter: grayscale(50%) opacity(50%);
  `}
`;

const VideoDisabled = styled.div`
  color: white;
  width: 100%;
  height: 20%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  border-radius: 10px;
  z-index: 2;
  top: 40%;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  padding: 20px;
  backdrop-filter: blur(10px); 
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
`;

const TopBar = styled.div`
  position: absolute;
  display: flex;
  width: 100%;
  z-index: 1;
  top: 0;
  padding: 5px;
  justify-content: space-between;
`;

const BottomBar = styled.div`
  position: absolute;
  display: flex;
  width: 100%;
  z-index: 1;
  bottom: 0;
  padding: 1px 7px;
  justify-content: space-between;
`;

const RaiseHand = styled.div`
  font-size: 32px;
`;

const UserCameraButtonsContainterWrapper = styled.div<UserCameraButtonsContainterWrapperProps>`
  position: absolute;
  z-index: 2;
  display: flex;
  width: 50%;

  ${({ positionXAxis }) => positionXAxis === 'right' && `
    right: 0;
    flex-direction: row-reverse;
  `}
  ${({ positionXAxis }) => positionXAxis === 'left' && `
    left: 0;
  `}

  ${({ positionYAxis }) => positionYAxis === 'top' && `
    top: 0;
  `}
  ${({ positionYAxis }) => positionYAxis === 'bottom' && `
    bottom: 0;
  `}
`;

export default {
  Content,
  UserCameraButtonsContainterWrapper,
  WebcamConnecting,
  LoadingText,
  VideoContainer,
  Video,
  TopBar,
  BottomBar,
  VideoDisabled,
  RaiseHand,
};
