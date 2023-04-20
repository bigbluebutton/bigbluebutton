import styled, { keyframes, css } from 'styled-components';
import {
  colorPrimary,
  colorBlack,
  colorWhite,
  webcamBackgroundColor,
  colorDanger,
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

const Content = styled.div`
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

    ${({ talking }) => talking && `
      border: 2px solid ${colorPrimary};
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

const WebcamConnecting = styled.div`
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

const VideoContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const Video = styled.video`
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

export default {
  Content,
  WebcamConnecting,
  LoadingText,
  VideoContainer,
  Video,
  TopBar,
  BottomBar,
};
