import styled from 'styled-components';
import {
  colorPrimary,
  colorBlack,
  colorWhite,
  webcamBackgroundColor,
} from '/imports/ui/stylesheets/styled-components/palette';
import { TextElipsis } from '/imports/ui/stylesheets/styled-components/placeholders';

const Content = styled.div`
  position: relative;
  display: flex;
  min-width: 100%;
  border-radius: 10px;
  border: 2px solid ${colorBlack};
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

  ${({ talking }) => talking && `
    border: 2px solid ${colorPrimary};
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
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  min-width: 100%;
  border-radius: 10px;
  background-color: ${webcamBackgroundColor};
  z-index: 1;

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
  object-fit: contain;
  font-size: 2.5rem;
  text-align: center;
  white-space: nowrap;
  z-index: 1;

  &::after {
    content: '';
    display: inline-block;
    height: 100%;
    vertical-align: middle;
    margin: 0 -0.25em 0 0;

    [dir="rtl"] & {
      margin: 0 0 0 -0.25em;
    }
  }

  &::before {
    content: "\\e949";
    /* ascii code for the ellipsis character */
    font-family: 'bbb-icons' !important;
    display: inline-block;

    ${({ animations }) => animations && `
      animation: spin 4s infinite linear;
    `}
  }

  background-color: transparent;
  color: ${colorWhite};
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
  Reconnecting,
  VideoContainer,
  Video,
  TopBar,
  BottomBar,
};
