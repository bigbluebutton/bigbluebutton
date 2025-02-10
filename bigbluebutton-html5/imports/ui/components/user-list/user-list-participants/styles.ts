import styled, { css, keyframes } from 'styled-components';
import {
  contentSidebarPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';

interface AvatarProps {
  color: string;
  animations?: boolean;
  moderator?: boolean;
  presenter?: boolean;
  isChrome?: boolean;
  isFirefox?: boolean;
  isEdge?: boolean;
  whiteboardAccess?: boolean;
  voice?: boolean;
  muted?: boolean;
  listenOnly?: boolean;
  noVoice?: boolean;
  avatar: string;
  emoji: string;
  talking?: boolean;
}

const Avatar = styled.div<AvatarProps>`
  position: relative;
  height: 2.25rem;
  width: 2.25rem;
  border-radius: 50%;
  text-align: center;
  font-size: .85rem;
  border: 2px solid transparent;
  user-select: none;
  ${({ color }) => css`
    background-color: ${color};
  `}
  }

  ${({ animations }) => animations && `
    transition: .3s ease-in-out;
  `}

  ${({ moderator }) => moderator && `
    border-radius: 5px;
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
    height: 3rem;
    width: 2rem;
  }
`;

const UserListColumn = styled.div`
  display: flex;
  flex-flow: column;
  min-height: 0;
  flex-grow: 1;
  padding: 0.5rem 0rem 0rem ${contentSidebarPadding};
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

const VirtualizedList = styled.div`
  display: flex;
  flex-flow: column;
  gap: 1rem;
`;

const UserListItem = styled.div``;

export default {
  Avatar,
  Skeleton,
  UserListColumn,
  VirtualizedList,
  UserListItem,
};
