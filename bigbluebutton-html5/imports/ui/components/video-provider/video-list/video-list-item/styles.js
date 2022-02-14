import styled from 'styled-components';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/common/button/component';
import {
  colorPrimary,
  colorBlack,
  colorWhite,
  colorOffWhite,
  colorDanger,
  colorSuccess,
  colorTransparent,
} from '/imports/ui/stylesheets/styled-components/palette';
import { TextElipsis, DivElipsis } from '/imports/ui/stylesheets/styled-components/placeholders';
import { landscape, mediumUp } from '/imports/ui/stylesheets/styled-components/breakpoints';
import {
  audioIndicatorWidth,
  audioIndicatorFs,
} from '/imports/ui/stylesheets/styled-components/general';

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

  ${({ mirrored }) => mirrored && `
    transform: scale(-1, 1);
  `}

  ${({ unhealthyStream }) => unhealthyStream && `
    filter: grayscale(50%) opacity(50%);
  `}
`;

const Info = styled.div`
  position: absolute;
  bottom: 1px;
  left: 7px;
  right: 5px;
  z-index: 2;
`;

const Dropdown = styled.div`
  display: flex;
  outline: none !important;
  width: 70%;

  @media ${mediumUp} {
    >[aria-expanded] {
      padding: .25rem;
    }
  }

  @media ${landscape} {
    button {
      width: calc(100vw - 4rem);
      margin-left: 1rem;
    }
  }

  ${({ isFirefox }) => isFirefox && `
    max-width: 100%;
  `}
`;

const UserName = styled(TextElipsis)`
  position: relative;
  max-width: 75%;
  // Keep the background with 0.5 opacity, but leave the text with 1
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 1px;
  color: ${colorOffWhite};
  padding: 0 1rem 0 .5rem !important;
  font-size: 80%;

  ${({ noMenu }) => noMenu && `
    padding: 0 .5rem 0 .5rem !important;
  `}
`;

const Muted = styled(Icon)`
  display: inline-block;
  position: absolute;
  right: 7px;
  bottom: 6px;
  width: ${audioIndicatorWidth};
  height: ${audioIndicatorWidth};
  min-width: ${audioIndicatorWidth};
  min-height: ${audioIndicatorWidth};
  color: ${colorWhite};
  border-radius: 50%;

  &::before {
    font-size: ${audioIndicatorFs};
  }

  background-color: ${colorDanger};
`;

const Voice = styled(Icon)`
  display: inline-block;
  position: absolute;
  right: 7px;
  bottom: 6px;
  width: ${audioIndicatorWidth};
  height: ${audioIndicatorWidth};
  min-width: ${audioIndicatorWidth};
  min-height: ${audioIndicatorWidth};
  color: ${colorWhite};
  border-radius: 50%;

  &::before {
    font-size: ${audioIndicatorFs};
  }

  background-color: ${colorSuccess};
`;

const DropdownTrigger = styled(DivElipsis)`
  position: relative;
  max-width: 75%;
  // Keep the background with 0.5 opacity, but leave the text with 1
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 1px;
  color: ${colorOffWhite};
  padding: 0 1rem 0 .5rem !important;
  font-size: 80%;

  cursor: pointer;

  &::after {
    content: "\\203a";
    position: absolute;
    transform: rotate(90deg);
    top: 45%;
    width: 0;
    line-height: 0;
    right: .45rem;
  }
`;

const PinButtonWrapper = styled.div`
  position: absolute;
  top: 0;
  left: auto;
  background-color: rgba(0,0,0,.3);
  cursor: pointer;
  border: 0;
  z-index: 2;
  margin: 2px;

  [dir="rtl"] & {
    right: auto;
    left :0;
  }

  [class*="presentationZoomControls"] & {
    position: relative !important;
  }
`;

const PinButton = styled(Button)`
  padding: 5px;
  &,
  &:active,
  &:hover,
  &:focus {
    background-color: ${colorTransparent} !important;
    border: none !important;

    & > i {
      border: none !important;
      color: ${colorWhite};
      font-size: 1rem;
      background-color: ${colorTransparent} !important;
    }
  }
`;

export default {
  Content,
  WebcamConnecting,
  LoadingText,
  Reconnecting,
  VideoContainer,
  Video,
  Info,
  Dropdown,
  UserName,
  Muted,
  Voice,
  DropdownTrigger,
  PinButtonWrapper,
  PinButton,
};