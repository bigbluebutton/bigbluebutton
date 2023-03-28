import styled from 'styled-components';
import {
  colorPrimary,
  listItemBgHover,
  itemFocusBorder,
  colorGray,
  colorWhite,
  colorGrayLightest,
  colorOffWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  borderSize,
  mdPaddingX,
  mdPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Button from '/imports/ui/components/common/button/component';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';

const ListItem = styled.div`
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

const CustomButton = styled(Button)`
  width: 100%;
  padding: .75rem;
  margin: .3rem 0;
  font-weight: 400;
  font-size: ${fontSizeBase};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Panel = styled.div`
  background-color: ${colorWhite};
  padding: ${mdPaddingX} ${mdPaddingY} ${mdPaddingX} ${mdPaddingX};

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
};
