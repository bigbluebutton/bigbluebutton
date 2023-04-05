import styled, { css, keyframes } from 'styled-components';
import {
  userIndicatorsOffset,
  mdPaddingY,
  indicatorPadding,
  borderSize,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorPrimary,
  colorWhite,
  userListBg,
  colorSuccess,
  colorDanger,
  colorOffWhite,
} from '/imports/ui/stylesheets/styled-components/palette';

import {
  ScrollboxVertical,
  VirtualizedScrollboxVertical,
} from '/imports/ui/stylesheets/styled-components/scrollable';

const Avatar = styled.div`
  position: relative;
  height: 2.25rem;
  width: 2.25rem;
  border-radius: 50%;
  text-align: center;
  font-size: .85rem;
  border: 2px solid transparent;
  user-select: none;
  ${
  ({ color }) => css`
    background-color: ${color};
  `}
  }

  ${({ animations }) => animations && `
    transition: .3s ease-in-out;
  `}

  &:after,
  &:before {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    padding-top: .5rem;
    padding-right: 0;
    padding-left: 0;
    padding-bottom: 0;
    color: inherit;
    top: auto;
    left: auto;
    bottom: ${userIndicatorsOffset};
    right: ${userIndicatorsOffset};
    border: 1.5px solid ${userListBg};
    border-radius: 50%;
    background-color: ${colorSuccess};
    color: ${colorWhite};
    opacity: 0;
    font-family: 'bbb-icons';
    font-size: .65rem;
    line-height: 0;
    text-align: center;
    vertical-align: middle;
    letter-spacing: -.65rem;
    z-index: 1;

    [dir="rtl"] & {
      left: ${userIndicatorsOffset};
      right: auto;
      padding-right: .65rem;
      padding-left: 0;
    }

    ${({ animations }) => animations && `
      transition: .3s ease-in-out;
    `}
  }

  ${({ moderator }) => moderator && `
    border-radius: 5px;
  `}

  ${({ presenter }) => presenter && `
    &:before {
      content: "\\00a0\\e90b\\00a0";
      padding: ${mdPaddingY} !important;
      opacity: 1;
      top: ${userIndicatorsOffset};
      left: ${userIndicatorsOffset};
      bottom: auto;
      right: auto;
      border-radius: 5px;
      background-color: ${colorPrimary};

      [dir="rtl"] & {
        left: auto;
        right: ${userIndicatorsOffset};
        letter-spacing: -.33rem;
      }
    }
  `}

  ${({
    presenter, isChrome, isFirefox, isEdge,
  }) => presenter && (isChrome || isFirefox || isEdge) && `
    &:before {
      padding: ${indicatorPadding} !important;
    }
  `}

  ${({ whiteboardAccess, presenter }) => whiteboardAccess && !presenter && `
    &:before {
      content: "\\00a0\\e925\\00a0";
      padding: ${mdPaddingY} !important;
      border-radius: 50% !important;
      opacity: 1;
      top: ${userIndicatorsOffset};
      left: ${userIndicatorsOffset};
      bottom: auto;
      right: auto;
      border-radius: 5px;
      background-color: ${colorPrimary};

      [dir="rtl"] & {
        left: auto;
        right: ${userIndicatorsOffset};
        letter-spacing: -.33rem;
        transform: scale(-1, 1);
      }
    }
  `}

  ${({
    whiteboardAccess, isChrome, isFirefox, isEdge,
  }) => whiteboardAccess && (isChrome || isFirefox || isEdge) && `
    &:before {
      padding: ${indicatorPadding};
    }
  `}

  ${({ voice }) => voice && `
    &:after {
      content: "\\00a0\\e931\\00a0";
      background-color: ${colorSuccess};
      top: 1.375rem;
      left: 1.375rem;
      right: auto;

      [dir="rtl"] & {
        left: auto;
        right: 1.375rem;
      }
      opacity: 1;
      width: 1.2rem;
      height: 1.2rem;
    }
  `}

  ${({ muted }) => muted && `
    &:after {
      content: "\\00a0\\e932\\00a0";
      background-color: ${colorDanger};
      opacity: 1;
      width: 1.2rem;
      height: 1.2rem;
    }
  `}

  ${({ listenOnly }) => listenOnly && `
    &:after {
      content: "\\00a0\\e90c\\00a0";
      opacity: 1;
      width: 1.2rem;
      height: 1.2rem;
    }
  `}

  ${({ noVoice }) => noVoice && `
    &:after {
      content: "";
      background-color: ${colorOffWhite};
      top: 1.375rem;
      left: 1.375rem;
      right: auto;

      [dir="rtl"] & {
        left: auto;
        right: 1.375rem;
      }

      opacity: 1;
      width: 1.2rem;
      height: 1.2rem;
    }
  `}

  // ================ talking animation ================
  ${({ talking, animations, color }) => talking && animations && css`
    animation: ${pulse(color)} 1s infinite ease-in;
  `}
  // ================ talking animation ================
  // ================ image ================
  ${({ avatar, emoji }) => avatar.length !== 0 && !emoji && css`
    background-image: url(${avatar});
    background-repeat: no-repeat;
    background-size: contain;
  `}
  // ================ image ================

  // ================ content ================
  color: ${colorWhite};
  font-size: 110%;
  text-transform: capitalize;
  display: flex;
  justify-content: center;
  align-items:center;  
  // ================ content ================
`;

const Skeleton = styled.div`
  & .react-loading-skeleton {    
    height: 2.25rem;
    width: 2.25rem;
  }
`;

const UserListColumn = styled.div`
  display: flex;
  flex-flow: column;
  min-height: 0;
  flex-grow: 1;
`;

const pulse = (color: String) => keyframes`
    0% {
      box-shadow: 0 0 0 0 ${color}80;
    }
    100% {
      box-shadow: 0 0 0 10px ${color}00;
    }
  }
`;

const VirtualizedList = styled(VirtualizedScrollboxVertical)`
  background: linear-gradient(#f3f6f9 30%, rgba(255,255,255,0)),
    linear-gradient(rgba(255,255,255,0), #f3f6f9 70%) 0 100%,
    /* Shadows */
    radial-gradient(farthest-side at 50% 0, rgba(0,0,0,.2), rgba(0,0,0,0)),
    radial-gradient(farthest-side at 50% 100%, rgba(0,0,0,.2), rgba(0,0,0,0)) 0 100%;

  outline: none;
`;

export default {
  Avatar,
  Skeleton,
  UserListColumn,
  VirtualizedList,
}