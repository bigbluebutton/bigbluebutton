import styled, { keyframes, css } from 'styled-components';
import {
  colorPrimary,
  colorBlack,
  colorWhite,
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

const Content = styled.div`
  position: relative;
  display: flex;
  min-width: 100%;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border: 5px solid ${colorPrimary};
    opacity: 0;
    pointer-events: none;

    ${({ animations }) => animations && `
      transition: opacity .1s;
    `}
  }

  ${({ talking }) => talking && `
    &::after {
      opacity: 0.7;
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
  position: relative;
  height: 100%;
  width: 100%;
  object-fit: contain;
  background-color: ${colorBlack};

  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  white-space: nowrap;
  z-index: 1;
  vertical-align: middle;
  border-radius: 1px;
  opacity: 1;

  position: relative;
  display: flex;
  min-width: 100%;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border: 5px solid ${colorPrimary};
    opacity: 0;
    pointer-events: none;

    ${({ animations }) => animations && `
      transition: opacity .1s;
    `}
  }

  ${({ talking }) => talking && `
    &::after {
      opacity: 0.7;
    }
  `}
`;

const LoadingText = styled(TextElipsis)`
  color: ${colorWhite};
  font-size: 100%;
`;

const Reconnecting = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  font-size: 2.5rem;
  z-index: 1;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: ${colorWhite};

  &::before {
    font-family: 'bbb-icons' !important;
    content: "\\e949";
    /* ascii code for the ellipsis character */
    display: inline-block;
    ${({ animations }) => animations && css`
      animation: ${rotate360} 2s infinite linear;
    `}
  }
`;

const VideoContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const Video = styled.video`
  position: relative;
  height: 100%;
  width: 100%;
  object-fit: contain;
  background-color: ${colorBlack};

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
  Reconnecting,
  VideoContainer,
  Video,
  TopBar,
  BottomBar,
};
