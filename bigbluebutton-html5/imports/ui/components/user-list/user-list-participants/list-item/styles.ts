import styled, { css, keyframes } from 'styled-components';
import {
  lgPaddingY,
  smPaddingY,
  borderSize,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  listItemBgHover,
  itemFocusBorder,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';

interface AvatarProps {
    moderator?: boolean;
    presenter?: boolean;
    talking?: boolean;
    muted?: boolean;
    listenOnly?: boolean;
    voice?: boolean;
    noVoice?: boolean;
    color?: string;
    animations?: boolean;
    emoji?: boolean;
    avatar?: string;
    isSkeleton?: boolean;
}

interface UserItemContentsProps {
  selected?: boolean;
  isActionsOpen?: boolean;
}

const UserItemContents = styled.div<UserItemContentsProps>`
  position: static;
  padding: .45rem;
  width: 100%;

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

    [dir="rtl"] & {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
    }

    &:first-child {
      margin-top: 0;
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
  height: 3rem;
  width: 3rem;
  min-width: 3rem;
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

  ${({ moderator }) => moderator && `
    border-radius: 5px;
    color: ${colorWhite} !important;
  `}

  // ================ talking animation ================
  ${({ talking, animations, color }) => talking && animations && color && css`
    animation: ${pulse(color)} 1s infinite ease-in;
  `}

  ${({ talking, animations }) => talking && !animations && `
    box-shadow: 0 0 0 4px currentColor;
  `}
  // ================ talking animation ================
  // ================ image ================
  ${({ avatar, emoji, color }) => avatar?.length !== 0 && !emoji && css`
    background-image: url(${avatar});
    background-repeat: no-repeat;
    background-size: contain;
    border: 2px solid ${color};
  `}
  // ================ image ================

  // ================ content ================
  color: ${colorWhite} !important;
  font-size: 110%;
  text-transform: capitalize;
  display: flex;
  justify-content: center;
  align-items:center;  
  // ================ content ================

  & .react-loading-skeleton {    
    height: 3rem;
    width: 3rem;
  }
`;

const Skeleton = styled.div``;

const pulse = (color: string) => keyframes`
    0% {
      box-shadow: 0 0 0 0 ${color}80;
    }
    100% {
      box-shadow: 0 0 0 10px ${color}00;
    }
  }
`;

// ======================== Icon Right Container ========================

const IconRightContainer = styled.div`
  margin: .25rem;  
`;

export default {
  Avatar,
  Skeleton,
  UserItemContents,
  IconRightContainer,
};
