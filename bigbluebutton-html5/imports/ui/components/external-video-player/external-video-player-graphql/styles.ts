import styled from 'styled-components';
import ReactPlayer from 'react-player';
import React from 'react';
import Button from '/imports/ui/components/common/button/component';

type VideoPlayerWrapperProps = {
  fullscreen: boolean;
  ref : React.MutableRefObject<HTMLDivElement | null>;
};

type ContainerProps = {
  isResizing: boolean;
  isMinimized: boolean;
};

export const Container = styled.span<ContainerProps>`
  position: absolute;
  pointer-events: inherit;
  background: var(--color-black);
  overflow: hidden;

  ${({ isResizing }) => isResizing && `
    pointer-events: none;
  `}
  ${({ isMinimized }) => isMinimized && `
    display: none;
  `}
`;

export const VideoPlayerWrapper = styled.div<VideoPlayerWrapperProps>`
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

export const AutoPlayWarning = styled.p`
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

export const VideoPlayer = styled(ReactPlayer)`
  width: 100%;
  height: 100%;
  z-index: 0;
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

// @ts-ignore - as button comes from JS, we can't provide its props
export const ExternalVideoCloseButton = styled(Button)`
  z-index: 1;
  position: absolute;
  top: 0;
  right: 0;
  left: auto;
  cursor: pointer;
  [dir="rtl"] & {
    right: auto;
    left :0;
  }
`;

export default {
  VideoPlayerWrapper,
  AutoPlayWarning,
  VideoPlayer,
  Container,
  ExternalVideoCloseButton,
};
