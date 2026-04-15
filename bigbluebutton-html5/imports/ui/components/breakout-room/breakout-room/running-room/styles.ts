import styled from 'styled-components';
import {
  colorPrimary,
  colorGray,
  colorGrayLighter,
  colorWhite,
  colorGrayUserListToolbar,
  colorText,
  colorDanger,
  colorBlueAux,
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

export const TimerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
`;

export const TimerTimeBtn = styled.button<{ $variant?: 'minus' | 'plus' }>`
  width: 3rem;
  height: 1.75rem;
  border-radius: 1rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  color: ${colorWhite};
  background: ${colorPrimary};
  flex-shrink: 0;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.85;
  }

  &:active {
    opacity: 0.7;
  }
`;

export const TimerDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
`;

export const TimerInput = styled.input<{ $selected?: boolean }>`
  width: 2.5rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colorText};
  border: none;
  border-bottom: 2px solid ${({ $selected }) => ($selected ? colorPrimary : 'transparent')};
  background: transparent;
  padding: 0;
  outline: none;
  -moz-appearance: textfield;
  transition: border-color 0.15s;

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

export const UsersSection = styled.div`
  border: 1px solid ${colorGrayLighter};
  border-radius: 0.75rem;
  margin: 0.5rem 0;
  overflow: hidden;
  min-height: 2.5rem;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;

  &.drag-over {
    border-color: ${colorPrimary};
    background: rgba(59, 130, 246, 0.04);
    box-shadow: 0 0 0 1px ${colorPrimary};
  }
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
  padding: 0.3rem 0.25rem;
  font-size: ${fontSizeSmall};
  color: ${colorText};
  cursor: grab;
  user-select: none;
  border-radius: 0.25rem;

  &:hover {
    background: ${colorGrayUserListToolbar};
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
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
  min-height: 3rem;

  &.drag-over {
    border-color: ${colorPrimary};
    background: rgba(59, 130, 246, 0.04);
    box-shadow: 0 0 0 1px ${colorPrimary};
  }
`;

export const RoomCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;
`;

export const RoomCardLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

export const RoomCardName = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${colorText};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  flex-shrink: 1;
  min-width: 0;

  &:hover {
    text-decoration: underline;
  }
`;

export const RoomNameInput = styled.input`
  font-size: 0.85rem;
  font-weight: 700;
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

export const RoomCardCountLeft = styled.span`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: ${fontSizeSmall};
  color: ${colorGray};
  white-space: nowrap;
  flex-shrink: 0;

  & > i {
    color: ${colorPrimary};
    font-size: 0.9rem;
  }
`;

export const RoomCardMenuWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

export const RoomCardMenuBtn = styled.button<{ $listening?: boolean }>`
  background: ${({ $listening }) => ($listening ? colorPrimary : 'transparent')};
  border: none;
  border-radius: 0.375rem;
  color: ${({ $listening }) => ($listening ? colorWhite : colorGray)};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 1px;
  width: 1.75rem;
  height: 1.5rem;
  padding: 0;
`;

export const RoomCardMenu = styled.div`
  background: ${colorWhite};
  border: 1px solid ${colorGrayLighter};
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  white-space: nowrap;
`;

export const RoomCardMenuItem = styled.button<{ $active?: boolean; $disabled?: boolean }>`
  display: block;
  width: 100%;
  padding: 0.45rem 0.75rem;
  font-size: 0.85rem;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  color: ${({ $active, $disabled }) => {
    if ($disabled) return colorGray;
    if ($active) return colorPrimary;
    return colorText;
  }};
  background: ${({ $active }) => ($active ? colorBlueAux : 'transparent')};
  border: none;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  text-align: left;
  white-space: nowrap;
  transition: background 0.12s;
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};

  &:hover {
    background: ${colorGrayLighter};
  }
`;

export const RoomCardUserList = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 0.5rem;
  gap: 0.1rem;
`;

export const RoomCardUserItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 0.25rem;
  font-size: ${fontSizeSmall};
  color: ${colorText};
  cursor: grab;
  user-select: none;
  border-radius: 0.25rem;

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

export const BottomBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin-top: auto;
  flex-shrink: 0;
  border-top: 1px solid ${colorGrayLighter};
`;

interface BtnProps {
  color?: string;
  disabled?: boolean;
  label: string;
  onClick: React.MouseEventHandler;
  role?: string;
  size?: string;
  icon?: string;
}

// @ts-ignore - Button is a JS component
export const MegaphoneBtn = styled<BtnProps>(Button)`
  background: ${colorPrimary};
  border: none;
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  color: ${colorWhite};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 0.95rem;
  font-weight: 600;

  & > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  & > span > i {
    display: none;
  }

  &:hover {
    opacity: 0.9;
  }
`;

// @ts-ignore - Button is a JS component
export const FinishBtn = styled<BtnProps>(Button)`
  background: ${colorDanger};
  border: none;
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  color: ${colorWhite};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: 0;
  font-size: 0.95rem;
  font-weight: 600;

  & > span {
    color: ${colorWhite} !important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    opacity: 0.9;
    background: ${colorDanger};
  }
`;

export const MegaphoneChatArea = styled.div`
  padding: 0 1rem 0.5rem;
  flex-shrink: 0;
`;

export const MegaphoneChatRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

export const MegaphoneChatInput = styled.input`
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${colorGrayLighter};
  border-radius: 1.5rem;
  font-size: 0.85rem;
  outline: none;
  color: ${colorText};
  background: ${colorWhite};
  transition: border-color 0.15s;

  &:focus {
    border-color: ${colorPrimary};
  }

  &::placeholder {
    color: ${colorGray};
  }
`;

export const MegaphoneSendBtn = styled.button`
  background: ${colorPrimary};
  color: ${colorWhite};
  border: none;
  border-radius: 50%;
  width: 2.25rem;
  height: 2.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default {
  PanelContent,
  HeaderContainer,
  Separator,
  ScrollContent,
  TimerSection,
  TimerLabel,
  TimerRow,
  TimerTimeBtn,
  TimerDisplay,
  TimerInput,
  TimerColon,
  UsersSection,
  UsersSectionHeader,
  UserCount,
  UsersList,
  UserItem,
  RoomCardsContainer,
  RoomCard,
  RoomCardHeader,
  RoomCardLeft,
  RoomCardName,
  RoomNameInput,
  RoomCardCountLeft,
  RoomCardMenuWrapper,
  RoomCardMenuBtn,
  RoomCardMenu,
  RoomCardMenuItem,
  RoomCardUserList,
  RoomCardUserItem,
  UserRemoveBtn,
  BottomBar,
  MegaphoneBtn,
  FinishBtn,
  MegaphoneChatArea,
  MegaphoneChatRow,
  MegaphoneChatInput,
  MegaphoneSendBtn,
};
