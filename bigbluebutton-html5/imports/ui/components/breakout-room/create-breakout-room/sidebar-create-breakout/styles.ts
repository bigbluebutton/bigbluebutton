import styled from 'styled-components';
import { styled as materialStyled } from '@mui/material/styles';
import { Switch } from '@mui/material';
import Select from '@mui/material/Select';
import {
  colorPrimary,
  colorGray,
  colorGrayLight,
  colorGrayLighter,
  colorWhite,
  colorGrayUserListToolbar,
  colorText,
  btnPrimaryBg,
  colorDanger,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';
import {
  PanelContent as BasePanelContent,
  HeaderContainer as BaseHeaderContainer,
  Separator as BaseSeparator,
} from '/imports/ui/components/sidebar-content/styles';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import Button from '/imports/ui/components/common/button/component';

export const PanelContent = styled(BasePanelContent)`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

export const HeaderContainer = styled(BaseHeaderContainer)``;

export const Separator = styled(BaseSeparator)``;

export const ScrollContent = styled(ScrollboxVertical)`
  overflow: hidden auto;
  flex-grow: 1;
  min-height: 0;
  padding: 0 1rem 1rem;
`;

export const TimerSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 1rem;
  gap: 0.25rem;
  flex-shrink: 0;
`;

export const TimerLabel = styled.span`
  font-size: ${fontSizeSmall};
  color: ${colorText};
`;

export const TimerWarning = styled.span`
  font-size: ${fontSizeSmall};
  color: ${colorDanger};
  margin-top: 0.15rem;
`;

export const TimerDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const TimerInput = styled.input`
  width: 2.5rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colorText};
  border: none;
  background: transparent;
  padding: 0;
  outline: none;
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    border-bottom: 2px solid ${colorPrimary};
  }
`;

export const TimerColon = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colorText};
`;

export const ControlsRow = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  gap: 0.75rem;
  flex-shrink: 0;
`;

export const RoomCountControl = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: ${colorGrayUserListToolbar};
  border-radius: 2rem;
  height: 2.75rem;
  padding: 0 1rem;
  flex: 1;
`;

export const RoomCountArrow = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${colorPrimary};
  font-size: 1.4rem;
  font-weight: 700;
  padding: 0 0.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  &:hover {
    opacity: 0.7;
  }

  &:disabled {
    color: ${colorGrayLight};
    cursor: not-allowed;
  }
`;

export const RoomCountValue = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${colorText};
  min-width: 1.5rem;
  text-align: center;
`;

interface ButtonProps {
  color?: string;
  disabled?: boolean;
  label: string;
  onClick: React.MouseEventHandler;
  role?: string;
  size?: string;
  icon?: string;
}

// @ts-ignore - Button is a JS component
export const RandomAssignBtn = styled<ButtonProps>(Button)`
  border-radius: 2rem !important;
  flex: 1;
  display: flex !important;
  align-items: center;
  justify-content: center;

  & i {
    font-size: 1.3rem;
  }
`;

export const MoreOptionsToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
  color: ${colorText};
  font-size: ${fontSizeSmall};
  font-weight: 600;
  flex-shrink: 0;
`;

export const ExpandIcon = styled.div<{ $expanded: boolean }>`
  width: 1.375rem;
  height: 1.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${({ $expanded }) => ($expanded ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: all 0.3s ease;
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

export const MoreOptionsContent = styled.div<{ $expanded: boolean }>`
  overflow: hidden;
  max-height: ${({ $expanded }) => ($expanded ? '300px' : '0')};
  transition: max-height 0.3s ease;
  padding: ${({ $expanded }) => ($expanded ? '0.25rem 1rem 0.5rem' : '0 1rem')};
  flex-shrink: 0;
`;

export const OptionRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0;
  font-size: ${fontSizeSmall};
  color: ${colorText};
  cursor: pointer;
`;

export const InfoBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  background: #e8f0fe;
  border-radius: 0.75rem;
  padding: 0.75rem;
  margin: 0.5rem 0;
  position: relative;
`;

export const InfoIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  min-width: 1rem;
  border-radius: 50%;
  background: ${colorPrimary};
  color: ${colorWhite};
  font-size: 0.6rem;
  font-weight: 400;
  font-style: normal;
  flex-shrink: 0;
  margin-top: 0.1rem;
`;

export const InfoText = styled.div`
  font-size: ${fontSizeSmall};
  color: ${colorText};
  line-height: 1.4;

  strong {
    display: block;
    margin-bottom: 0.15rem;
  }
`;

export const InfoClose = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: ${colorGray};
  font-size: 0.85rem;
  padding: 0;
  line-height: 1;

  &:hover {
    color: ${colorText};
  }
`;

export const InfoGotItBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${colorPrimary};
  font-size: ${fontSizeSmall};
  font-weight: 600;
  padding: 0;
  text-decoration: underline;

  &:hover {
    opacity: 0.8;
  }
`;

export const UsersSection = styled.div`
  border: 1px solid ${colorGrayLighter};
  border-radius: 0.75rem;
  margin: 0.5rem 0;
  overflow: hidden;
`;

export const UsersSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.75rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: ${colorText};
`;

export const UserCount = styled.span`
  color: ${colorGray};
  font-weight: 400;
  font-size: 0.8rem;
`;

export const UsersList = styled.div`
  max-height: 12rem;
  overflow-y: auto;
  padding: 0 0.75rem 0.5rem;
`;

export const UserItem = styled.div`
  padding: 0.3rem 0;
  font-size: ${fontSizeSmall};
  color: ${colorText};
  cursor: grab;
  user-select: none;

  &:hover {
    background: ${colorGrayUserListToolbar};
    border-radius: 0.25rem;
  }

  &:active {
    cursor: grabbing;
  }
`;

export const RoomCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
  gap: 0.5rem;
  margin: 0.5rem 0;
`;

export const RoomCard = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${colorGrayLighter};
  border-radius: 0.75rem;
  padding: 0.75rem;
  transition: background 0.15s, border-color 0.15s;
  min-height: 3rem;
  min-width: 0;
  overflow: hidden;
`;

export const RoomCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;
  min-width: 0;
`;

export const RoomCardName = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${colorText};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex-shrink: 1;
`;

export const RoomNameInput = styled.input`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${colorText};
  border: none;
  border-bottom: 1.5px solid ${colorPrimary};
  background: transparent;
  outline: none;
  padding: 0;
  width: 100%;
  min-width: 0;
  flex-shrink: 1;
`;

export const RoomCardRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
`;

export const RoomCardCount = styled.span`
  font-size: ${fontSizeSmall};
  color: ${colorGray};
`;

export const RoomCardIcon = styled.span`
  color: ${colorPrimary};
  font-size: 1rem;
`;

export const RoomCardUserList = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 0.5rem;
  gap: 0.1rem;
`;

export const RoomCardUserItem = styled.div`
  padding: 0.25rem 0.25rem;
  font-size: ${fontSizeSmall};
  color: ${colorText};
  cursor: grab;
  user-select: none;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    background: ${colorGrayUserListToolbar};
  }

  &:active {
    cursor: grabbing;
  }
`;

export const UserRemoveBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${colorGray};
  font-size: 0.75rem;
  padding: 0 0.15rem;
  line-height: 1;
  opacity: 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  transition: opacity 0.1s, color 0.1s;

  ${RoomCardUserItem}:hover & {
    opacity: 1;
  }

  &:hover {
    color: ${colorDanger};
  }
`;

export const PresentationSelect = styled(Select)`
  width: 100%;
  margin-top: 0.5rem;
  height: 2rem;
  border-radius: 0.4rem !important;
  overflow: hidden;
  font-size: 0.75rem;

  & .MuiSelect-select {
    padding: 0.15rem 0.5rem;
    font-size: 0.75rem;
  }
`;

export const StartButtonWrapper = styled.div`
  padding: 0.75rem 1rem;
  margin-top: auto;
`;

export const StartButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border-radius: 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  color: ${colorWhite};
  background: ${colorPrimary};
  border: 2px solid ${colorPrimary};
  transition: all 0.15s;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const MaterialSwitch = materialStyled(Switch)(({ theme }) => ({
  width: 24,
  height: 14,
  padding: 0,
  display: 'flex',
  '&:active': {
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
    width: 7,
    height: 7,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], { duration: 200 }),
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

export default {
  PanelContent,
  HeaderContainer,
  Separator,
  ScrollContent,
  TimerSection,
  TimerLabel,
  TimerWarning,
  TimerDisplay,
  TimerInput,
  TimerColon,
  ControlsRow,
  RoomCountControl,
  RoomCountArrow,
  RoomCountValue,
  RandomAssignBtn,
  MoreOptionsToggle,
  ExpandIcon,
  MoreOptionsContent,
  OptionRow,
  InfoBanner,
  InfoIcon,
  InfoText,
  InfoClose,
  InfoGotItBtn,
  UsersSection,
  UsersSectionHeader,
  UserCount,
  UsersList,
  UserItem,
  RoomCardsContainer,
  RoomCard,
  RoomCardHeader,
  RoomCardName,
  RoomNameInput,
  RoomCardRight,
  RoomCardCount,
  RoomCardIcon,
  RoomCardUserList,
  RoomCardUserItem,
  UserRemoveBtn,
  PresentationSelect,
  StartButtonWrapper,
  StartButton,
  MaterialSwitch,
};
