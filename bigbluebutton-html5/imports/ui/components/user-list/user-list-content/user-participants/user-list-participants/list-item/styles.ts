import styled, { css, keyframes } from 'styled-components';

import {
  lgPaddingY,
  smPaddingY,
  borderSize,
  smPaddingX,
  userIndicatorsOffset,
  mdPaddingY,
  indicatorPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  listItemBgHover,
  itemFocusBorder,
  colorGray,
  colorGrayDark,
  colorPrimary,
  colorWhite,
  userListBg,
  colorSuccess,
  colorDanger,
  colorOffWhite,
} from '/imports/ui/stylesheets/styled-components/palette';


interface AvatarProps {
  moderator: string;
  presenter: string;
  talking: boolean;
  muted: boolean;
  listenOnly: boolean;
  voice: boolean;
  noVoice: boolean;
  color: string;
  whiteboardAccess: boolean;
  animations: boolean;
  emoji: string;
  avatar: string;
  isChrome: boolean;
  isFirefox: boolean;
  isEdge: boolean;
}

interface UserItemContentsProps {
  selected: boolean;
  isActionsOpen: boolean;
}

const UserItemContents = styled.div<UserItemContentsProps>`
  position: static;
  padding: .45rem;
  width: 100%;
  margin-left: .5rem;


  ${({ selected }) => selected && `
    background-color: ${listItemBgHover};
    border-top-left-radius: ${smPaddingY};
    border-bottom-left-radius: ${smPaddingY};

    &:focus {
      box-shadow: inset 0 0 0 ${borderSize} ${itemFocusBorder}, inset 1px 0 0 1px ${itemFocusBorder};
    }
  `}

  ${({ isActionsOpen }) => !isActionsOpen && `
    display: flex;
    flex-flow: row;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    cursor: pointer;

    [dir="rtl"] & {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
    }

    &:first-child {
      margin-top: 0;
    }

    &:hover {
      outline: transparent;
      outline-style: dotted;
      outline-width: ${borderSize};
      background-color: ${listItemBgHover};
    }

    &:active,
    &:focus {
      outline: transparent;
      outline-width: ${borderSize};
      outline-style: solid;
      background-color: ${listItemBgHover};
      box-shadow: inset 0 0 0 ${borderSize} ${itemFocusBorder}, inset 1px 0 0 1px ${itemFocusBorder};
    }
    flex-flow: column;
    flex-shrink: 0;
  `}

  ${({ isActionsOpen }) => isActionsOpen && `
    outline: transparent;
    outline-width: ${borderSize};
    outline-style: solid;
    background-color: ${listItemBgHover};
    box-shadow: inset 0 0 0 ${borderSize} ${itemFocusBorder}, inset 1px 0 0 1px ${itemFocusBorder};
    border-top-left-radius: ${smPaddingY};
    border-bottom-left-radius: ${smPaddingY};

    &:focus {
      outline-style: solid;
      outline-color: transparent !important;
    }
  `}

  flex-grow: 0;
  display: flex;
  flex-flow: row;
  border: 3px solid transparent;

  [dir="rtl"] & {
    padding: ${lgPaddingY} ${lgPaddingY} ${lgPaddingY} 0;
  }
`;

// ===== avatar =====

const Avatar = styled.div<AvatarProps>`
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
  ${({ avatar, emoji }) => avatar?.length !== 0 && !emoji && css`
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

  & .react-loading-skeleton {    
    height: 2.25rem;
    width: 2.25rem;
  }
`;

const Skeleton = styled.div`
 
`;

const pulse = (color: string) => keyframes`
    0% {
      box-shadow: 0 0 0 0 ${color}80;
    }
    100% {
      box-shadow: 0 0 0 10px ${color}00;
    }
  }
`;

// ======================== User Name ========================

const UserNameContainer = styled.div`
  display: flex;
  flex-flow: column;
  min-width: 0;
  flex-grow: 1;
  margin: 0 0 0 ${smPaddingX};
  justify-content: center;
  font-size: 90%;

  [dir="rtl"]  & {
    margin: 0 ${smPaddingX} 0 0;
  }
`;

const UserName = styled.span`
  margin: 0;
  font-size: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 400;
  color: ${colorGrayDark};
  display: flex;
  flex-direction: row;

  > span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  &.animationsEnabled {
    transition: all .3s;
  }`;

const UserNameSub = styled.span`
  margin: 0;
  font-size: 0.75rem;
  font-weight: 200;
  color: ${colorGray};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  i {
    line-height: 0;
    font-size: 75%;
  }
`;

export default {
  Avatar,
  Skeleton,
  UserItemContents,
  UserNameContainer,
  UserNameSub,
  UserName,
}