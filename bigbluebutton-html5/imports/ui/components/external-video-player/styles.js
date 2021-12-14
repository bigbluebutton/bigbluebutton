import styled from 'styled-components';
import ReactPlayer from 'react-player';

const VideoPlayerWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  ${({ fullscreen }) => fullscreen && `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 99;
  `}
`;

const AutoPlayWarning = styled.p`
  position: absolute;
  z-index: 100;
  font-size: x-large;
  color: white;
  width: 100%;
  background-color: rgba(6,23,42,0.5);
  bottom: 20%;
  vertical-align: middle;
  text-align: center;
  pointer-events: none;
`;

const VideoPlayer = styled(ReactPlayer)`
  width: 100%;
  height: 100%;
  & > iframe {
    display: flex;
    flex-flow: column;
    flex-grow: 1;
    flex-shrink: 1;
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
    border-style: none;
    border-bottom: none;
  }
`;

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

    :hover > & {
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
  VideoPlayerWrapper,
  AutoPlayWarning,
  VideoPlayer,
  MobileControlsOverlay,
  HoverToolbar,
};
