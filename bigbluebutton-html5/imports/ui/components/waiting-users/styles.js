import styled from 'styled-components';
import {
  colorPrimary,
  listItemBgHover,
  itemFocusBorder,
  colorGray,
  colorWhite,
  colorGrayDark,
  colorGrayLightest,
  colorOffWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  borderSize,
  borderSizeLarge,
  mdPaddingX,
  mdPaddingY,
  pollHeaderOffset,
  toastContentWidth,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { DivElipsis } from '/imports/ui/stylesheets/styled-components/placeholders';
import Button from '/imports/ui/components/button/component';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';

const ListItem = styled.div`
  display: flex;
  flex-flow: row;
  flex-direction: row;
  align-items: center;
  border-radius: 5px;
  cursor: pointer;

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

  &:hover {
    background-color: ${listItemBgHover};
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
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-self: flex-end;
  align-items: center;
  color: ${colorPrimary};
  & > button {
    padding: 0 .25rem 0 .25rem;
  }
`;

const WaitingUsersButton = styled(Button)`
  font-weight: 400;

  &:focus {
    background-color: ${listItemBgHover} !important;
    box-shadow: inset 0 0 0 ${borderSize} ${itemFocusBorder}, inset 1px 0 0 1px ${itemFocusBorder} ;
    outline: none;
  }

  &:hover {
    background-color: ${listItemBgHover} !important;
  }
`;

const PendingUsers = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
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
  height: 100%;
  width: 100%;
  flex-direction: column;
  position: relative;
`;

const Users = styled.div`
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  position: absolute;
  top: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
`;

const CustomButton = styled(Button)`
  width: 100%;
  padding: .75rem;
  margin: .3rem 0;
  font-weight: 400;
  font-size: ${fontSizeBase};
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

const Header = styled.header`
  position: relative;
  top: ${pollHeaderOffset};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled(DivElipsis)`
  flex: 1;

  & > button, & > button:hover {
    max-width: ${toastContentWidth};
  }
`;

const HideButton = styled(Button)`
  position: relative;
  background-color: ${colorWhite};
  display: block;
  margin: ${borderSizeLarge};
  margin-bottom: ${borderSize};
  padding-left: 0;
  padding-right: inherit;

  [dir="rtl"] & {
    padding-left: inherit;
    padding-right: 0;
  }

  & > i {
    color: ${colorGrayDark};
    font-size: smaller;

    [dir="rtl"] & {
      -webkit-transform: scale(-1, 1);
      -moz-transform: scale(-1, 1);
      -ms-transform: scale(-1, 1);
      -o-transform: scale(-1, 1);
      transform: scale(-1, 1);
    }
  }

  &:hover {
    background-color: ${colorWhite};
  }
`;

const LobbyMessage = styled.div`
  border-bottom: 1px solid ${colorGrayLightest};

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

export default {
  ListItem,
  UserContentContainer,
  UserAvatarContainer,
  PrivateLobbyMessage,
  UserName,
  ButtonContainer,
  WaitingUsersButton,
  PendingUsers,
  NoPendingUsers,
  MainTitle,
  UsersWrapper,
  Users,
  CustomButton,
  Panel,
  Header,
  Title,
  HideButton,
  LobbyMessage,
  RememberContainer,
  ScrollableArea,
};
