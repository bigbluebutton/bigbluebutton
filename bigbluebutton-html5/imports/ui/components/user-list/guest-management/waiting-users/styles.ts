import styled from 'styled-components';
import {
  colorPrimary,
  listItemBgHover,
  itemFocusBorder,
  colorGray,
  colorWhite,
  colorDanger,
  colorGrayLighter,
  colorGrayLightest,
  colorText,
  colorGrayDark,
  colorOffWhite,
  btnPrimaryBg,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  borderSize,
  xsPadding,
  smPaddingY,
  borderRadius,
  smPaddingX,
  contentSidebarBorderRadius,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeBase,
  fontSizeSmall, fontSizeSmaller, textFontWeight, titlesFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { FormControlLabel, Switch, ButtonBase } from '@mui/material';
import { styled as materialStyled } from '@mui/material/styles';
import TextareaAutosize from 'react-autosize-textarea';
import Button from '@mui/material/Button';
import UserAvatar from '/imports/ui/components/user-avatar/component';

type ListItemProps = {
  animations: boolean;
};

type PanelProps = {
  isChrome: boolean;
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
  gap: 0.5rem;
`;

const UserAvatarContainer = styled.div`
  min-width: 2.25rem;
`;

const UserName = styled.div`
  min-width: 0;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: initial;
  color: ${colorGray};
  font-weight: ${textFontWeight};
  line-height: 120%;
`;

const PendingUsers = styled.div`
  display: flex;
  flex-direction: column;
`;

const MainTitle = styled.div`
  color: ${colorGray};
  font-weight: ${textFontWeight};
  flex: 1 0 0;
`;

const UsersWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 0.5rem 0.5rem;
`;

const Users = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Panel = styled.div<PanelProps>`
  background-color: ${colorWhite};
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
  padding-top: 0.5rem;
  gap: 1rem;

  ${({ isChrome }) => isChrome && `
    transform: translateZ(0);
  `}

  @media ${smallOnly} {
    transform: none !important;
  }
`;

const Avatar = styled(UserAvatar)`
  height: 2rem;
  min-height: 2rem;
  width: 2rem;
  min-width: 2rem;
`;

const WaitingUsersHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  align-self: stretch; 
  cursor: pointer;
`;

const WaitingUsersContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  align-self: stretch;
`;

const GuestNumberIndicator = styled.div`
  color: ${colorWhite};
  font-size: ${fontSizeSmaller};
  font-style: normal;
  font-weight: ${titlesFontWeight};
  line-height: normal;
`;

const GuestOptionsContainer = styled.div`
  flex-shrink: 0;
  display: flex;
  background: #F4F6FA;
  padding: 0.25rem 0.5rem;
  align-items: center;
  border-radius: 1.5rem;
  height: 1.5rem;
`;

const AcceptDenyButtonsContainer = styled.div`
  display: inline-flex;
  justify-content: space-between
  align-items: center;
  padding: 0px 0.5rem 0.5rem;
  gap: 1.5rem;
`;

const AcceptDenyButtonText = styled.div`
  font-size: ${fontSizeSmall};
  font-weight: ${textFontWeight};
  line-height: 120%;
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-skip-ink: none;
  text-decoration-thickness: auto;
  text-underline-offset: auto;
  text-underline-position: from-font;
`;

const AcceptAllButton = styled.div`
  display: flex;
  color: ${colorPrimary};
  align-items: center;
  gap: 0.5rem;
  font-size: ${fontSizeSmall};
  cursor: pointer;
`;

const DenyAllButton = styled.div`
  display: flex;
  color: ${colorDanger};
  align-items: center;
  gap: 0.5rem;
  font-size: ${fontSizeSmall};
  cursor: pointer;
`;

const GuestLobbyMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  width: 100%;
  gap: 0.5rem;
  padding-top: 1rem;
`;

const SwitchTitle = styled(FormControlLabel)`
  //height: 1.5rem;
  //width: 1.5rem;
  //flex-shrink: 0;
  .MuiFormControlLabel-label {
    color: ${colorText};
    font-size: ${fontSizeBase}
    font-weight: ${textFontWeight};
    line-height: normal;
  }
`;

const MessageSwitch = materialStyled(Switch)(({ theme }) => ({
  width: 22,
  height: 12,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      // width: 10,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: colorPrimary,
        ...theme.applyStyles('dark', {
          backgroundColor: colorPrimary,
        }),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 6,
    height: 6,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
    transform: 'translateY(1px)',
  },
  '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: 'rgba(0,0,0,.25)',
    boxSizing: 'border-box',
    ...theme.applyStyles('dark', {
      backgroundColor: 'rgba(255,255,255,.35)',
    }),
  },
}));

const SendButton = styled(Button)`
  align-self: center;
  font-size: 0.9rem;
  height: 100%;
  background-color: ${colorPrimary} !important;

  & > span {
    height: 100%;
    display: flex;
    align-items: center;
    border-radius: 0 0.75rem 0.75rem 0;
  }

  [dir="rtl"]  & {
    -webkit-transform: scale(-1, 1);
    -moz-transform: scale(-1, 1);
    -ms-transform: scale(-1, 1);
    -o-transform: scale(-1, 1);
    transform: scale(-1, 1);
  }
`;

const Input = styled(TextareaAutosize)`
  flex: 1;
  background: #fff;
  background-clip: padding-box;
  margin: ${xsPadding} 0 ${xsPadding} ${xsPadding};
  color: ${colorGrayLighter};
  -webkit-appearance: none;
  padding: calc(${smPaddingY} * 2.5) 0 calc(${smPaddingX} * 1.25) calc(${smPaddingY} * 2.5);
  resize: none;
  transition: color 0.3s ease;
  border-radius: ${borderRadius};
  font-size: ${fontSizeBase};
  line-height: 1;
  min-height: 2.5rem;
  max-height: 3.5rem;
  overflow-y: auto;
  box-shadow: none;
  outline: none;

  border: 1px solid ${colorGrayLightest};

  [dir='ltr'] & {
    border-radius: 0.75rem 0 0 0.75rem;
  }

  [dir='rtl'] & {
    border-radius: 0 0.75rem 0.75rem 0;
  }

  &:focus {
    color: ${colorText};
  }

  &:disabled,
  &[disabled] {
    cursor: not-allowed;
    opacity: .75;
    background-color: rgba(167,179,189,0.25);
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  min-width: 0;
  width: 100%;
  z-index: 0;
  border-radius: 0.75rem;
  height: 3.5rem;
`;

const NoMessageText = styled.div`
  padding-left: 2.5rem;
  color: ${colorText};
  font-size: ${fontSizeSmall};
`;

const GuestLobbyMessage = styled.div`
  color: ${colorText};
  font-size: ${fontSizeSmall};
  font-style: italic;  
`;

export const ToggleButton = styled(ButtonBase)`
  width: 100%;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease;
  border-radius: ${contentSidebarBorderRadius};

  &:focus {
    outline: 2px solid ${colorOffWhite};
    border-radius: ${contentSidebarBorderRadius};
    outline-offset: -2px;
  }
`;

export const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: ${colorOffWhite};
`;

export const ExpandIcon = styled.div<{ $expanded: boolean }>`
  width: 1.375rem;
  height: 1.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${({ $expanded }) => ($expanded ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: all 0.3s ease;
  margin-right: 0.75rem;
  border-radius: 50%;
  background-color: ${btnPrimaryBg};

  svg {
    color: ${colorWhite};
    font-size: 1.25rem;
    transition: transform 0.3s ease;
  }

  &:hover {
    filter: brightness(0.9);
  }
`;

export const TitleText = styled.span`
  font-size: ${fontSizeSmall};
  font-weight: ${textFontWeight};
  color: ${colorGrayDark};
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 1rem;
`;

export default {
  TitleText,
  ExpandIcon,
  ButtonContent,
  ToggleButton,
  ListItem,
  UserContentContainer,
  UserAvatarContainer,
  UserName,
  PendingUsers,
  MainTitle,
  UsersWrapper,
  Users,
  Panel,
  Avatar,
  WaitingUsersHeader,
  GuestNumberIndicator,
  GuestOptionsContainer,
  AcceptDenyButtonsContainer,
  AcceptAllButton,
  DenyAllButton,
  AcceptDenyButtonText,
  GuestLobbyMessageContainer,
  SwitchTitle,
  MessageSwitch,
  SendButton,
  Input,
  InputWrapper,
  NoMessageText,
  GuestLobbyMessage,
  WaitingUsersContainer,
};
