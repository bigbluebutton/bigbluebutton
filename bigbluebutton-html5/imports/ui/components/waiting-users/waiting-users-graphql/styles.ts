import styled, { css, keyframes } from 'styled-components';
import {
  colorPrimary,
  listItemBgHover,
  itemFocusBorder,
  colorGray,
  colorWhite,
  colorGrayLightest,
  colorOffWhite,
  userListBg,
  colorSuccess,
  colorDanger,

} from '/imports/ui/stylesheets/styled-components/palette';
import {
  borderSize,
  smPaddingX,
  mdPaddingY,
  userIndicatorsOffset,
  indicatorPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Button from '/imports/ui/components/common/button/component';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';

type ListItemProps = {
  animations: boolean;
};

type PanelProps = {
  isChrome: boolean;
};

type AvatarProps = {
  color: string;
  avatar: string;
  key: string;
  moderator: boolean;
  animations?: boolean;
  presenter?: boolean;
  whiteboardAccess?: boolean;
  voice?: boolean;
  muted?: boolean;
  listenOnly?: boolean;
  noVoice?: boolean;
  talking?: boolean;
  emoji?: string;
  isChrome?: boolean;
  isFirefox?: boolean;
  isEdge?: boolean;
};

const ListItem = styled.div<ListItemProps>`
  display: flex;
  flex-flow: row;
  flex-direction: row;
  align-items: center;
  border-radius: 5px;

  ${({ animations }) => animations && `
    transition: all .3s;
  `}

  &:first-child {
    margin-top: 0;
  }

  &:focus {
    background-color: ${listItemBgHover};
    box-shadow: inset 0 0 0 ${borderSize} ${itemFocusBorder}, inset 1px 0 0 1px ${itemFocusBorder};
    outline: none;
  }

  flex-shrink: 0;
`;

const UserContentContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  align-items: center;
  flex-direction: row;
`;

const UserAvatarContainer = styled.div`
  min-width: 2.25rem;
  margin: .5rem;
`;

const UserName = styled.p`
  min-width: 0;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: initial;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-self: flex-end;
  align-items: center;
  color: ${colorPrimary};
  & > button {
    padding: ${mdPaddingY};
    font-size: ${fontSizeBase};
    border-radius: 50%;
  }
`;
// @ts-ignore - Button is JS
const WaitingUsersButton = styled(Button)`
  font-weight: 400;
  color: ${colorPrimary};

  &:focus {
    background-color: ${listItemBgHover} !important;
    box-shadow: inset 0 0 0 ${borderSize} ${itemFocusBorder}, inset 1px 0 0 1px ${itemFocusBorder} ;
    outline: none;
  }

  &:hover {
    color: ${colorPrimary};
    background-color: ${listItemBgHover} !important;
  }
`;
// @ts-ignore - Button is JS
const WaitingUsersButtonMsg = styled(Button)`
  font-weight: 400;
  color: ${colorPrimary};

  &:after {
    font-family: 'bbb-icons';
    content: "\\E910";
  }

  &:focus {
    background-color: ${listItemBgHover} !important;
    box-shadow: inset 0 0 0 ${borderSize} ${itemFocusBorder}, inset 1px 0 0 1px ${itemFocusBorder} ;
    outline: none;
  }

  &:hover {
    color: ${colorPrimary};
    background-color: ${listItemBgHover} !important;
  }
`;
// @ts-ignore - Button is JS
const WaitingUsersButtonDeny = styled(Button)`
  font-weight: 400;
  color: #ff0e0e;

  &:focus {
    background-color: ${listItemBgHover} !important;
    box-shadow: inset 0 0 0 ${borderSize} ${itemFocusBorder}, inset 1px 0 0 1px ${itemFocusBorder} ;
    outline: none;
  }

  &:hover {
    color: #ff0e0e;
    background-color: ${listItemBgHover} !important;
  }
`;

const PendingUsers = styled.div`
  display: flex;
  flex-direction: column;
`;

const NoPendingUsers = styled.p`
  text-align: center;
  font-weight: bold;
`;

const MainTitle = styled.p`
  color: ${colorGray};
`;

const UsersWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Users = styled.div`
  display: flex;
  flex-direction: column;
`;
// @ts-ignore - Button is JS
const CustomButton = styled(Button)`
  width: 100%;
  padding: .75rem;
  margin: .3rem 0;
  font-weight: 400;
  font-size: ${fontSizeBase};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Panel = styled.div<PanelProps>`
  background-color: ${colorWhite};
  padding: ${smPaddingX};
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
  height: 100%;

  ${({ isChrome }) => isChrome && `
    transform: translateZ(0);
  `}

  @media ${smallOnly} {
    transform: none !important;
  }
`;

const LobbyMessage = styled.div`
  border-bottom: 1px solid ${colorGrayLightest};
  margin: 2px 2px 0 2px;

  & > p {
    background-color: ${colorOffWhite};
    box-sizing: border-box;
    color: ${colorGray};
    padding: 1rem;
    text-align: center;
  }
`;

const PrivateLobbyMessage = styled.div`
  border-bottom: 1px solid ${colorGrayLightest};
  display: none;
  & > p {
    background-color: ${colorOffWhite};
    box-sizing: border-box;
    color: ${colorGray};
    padding: 1rem;
    text-align: center;
  }
`;

const RememberContainer = styled.div`
  margin: 1rem 1rem;
  height: 2rem;
  display: flex;
  align-items: center;
  & > label {
    height: fit-content;
    padding: 0;
    margin: 0;
    margin-left: .7rem;

    [dir="rtl"] & {
      margin: 0;
      margin-right: .7rem;
    }
  }
`;

const ScrollableArea = styled(ScrollboxVertical)`
  overflow-y: auto;
  padding-right: 0.25rem;
`;

const ModeratorActions = styled.div`
  padding: 0 .2rem;
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

export default {
  ListItem,
  UserContentContainer,
  UserAvatarContainer,
  PrivateLobbyMessage,
  UserName,
  ButtonContainer,
  WaitingUsersButton,
  WaitingUsersButtonDeny,
  WaitingUsersButtonMsg,
  PendingUsers,
  NoPendingUsers,
  MainTitle,
  UsersWrapper,
  Users,
  CustomButton,
  Panel,
  LobbyMessage,
  RememberContainer,
  ScrollableArea,
  ModeratorActions,
  Avatar,
};
