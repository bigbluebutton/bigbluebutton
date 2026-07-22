import styled, { css } from 'styled-components';
import { borderRadiusRounded } from '/imports/ui/stylesheets/styled-components/general';
import {
  colorPrimary,
  colorGray,
  colorGrayLighter,
  colorWhite,
  colorGrayUserListToolbar,
  colorText,
  colorDanger,
  colorBlueLighter,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import {
  PanelContent as BasePanelContent,
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
  font-size: ${fontSizeBase};
  color: ${colorText};
`;

export const TimeInputGroup = styled.div`
  display: flex;
  align-items: center;
  font-size: 2.2rem;
  color: ${colorText};
  justify-content: center;
  gap: 1rem;
`;

export const TimeUnitContainer = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

export const TimerInput = styled.input<{ $selected?: boolean }>`
  background: none;
  border: none;
  background-color: color-mix(in srgb, ${colorBlueLighter} 20%, transparent);
  color: ${colorPrimary};
  font-family: inherit;
  font-size: 2rem;
  line-height: 1.2;
  font-weight: 600;
  border-radius: ${borderRadiusRounded};
  font-variant-numeric: tabular-nums;
  text-align: center;
  width: 5rem;
  height: 2.8rem;
  padding: 0.4rem 1rem 0.2rem 0;
  -moz-appearance: textfield;
  outline: none;
  transition: all 150ms ease;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    outline: none;
    background-color: color-mix(in srgb, ${colorPrimary} 15%, transparent);
    box-shadow: 0 0 0 0.125rem ${colorPrimary};
  }

  ${({ $selected }) => $selected && css`
    background-color: color-mix(in srgb, ${colorPrimary} 15%, transparent);
    box-shadow: 0 0 0 0.125rem ${colorPrimary};
  `}

  &:disabled,
  &[disabled] {
    cursor: not-allowed;
    opacity: .75;
    background-color: transparent;
  }
`;

export const TimeUnitLabel = styled.span`
  font-size: 0.80rem;
  color: ${colorGray};
  text-transform: capitalize;
`;

export const InputArrows = styled.div<{ disabled?: boolean; $selected?: boolean }>`
  position: absolute;
  right: 0;
  padding-top: 0.2rem;
  padding-bottom: 0.2rem;
  padding-right: 0.1rem;
  height: 2.8rem;
  width: 1.6rem;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  opacity: ${({ disabled }) => (disabled ? 0.4 : 0.8)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
  background: none;
  border: none;
  background-color: ${({ $selected }) => ($selected
    ? `color-mix(in srgb, ${colorPrimary} 15%, transparent)`
    : `color-mix(in srgb, ${colorBlueLighter} 20%, transparent)`)};
  border-radius: ${borderRadiusRounded};
  transition: all 150ms ease;
`;

export const InputArrowButton = styled.button`
  flex: 1;
  min-width: auto;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-left: 0.25rem solid transparent;
    border-right: 0.25rem solid transparent;
    border-bottom: 0.28rem solid ${colorPrimary};
    margin: auto;
    transition: border-bottom-color 120ms ease;
  }

  &:hover::before {
    opacity: 1;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

export const InputArrowButtonDown = styled.button`
  flex: 1;
  min-width: auto;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-left: 0.25rem solid transparent;
    border-right: 0.25rem solid transparent;
    border-top: 0.28rem solid ${colorPrimary};
    margin: auto;
    transition: border-top-color 120ms ease;
  }

  &:hover::before {
    opacity: 1;
  }

  &:disabled {
    cursor: not-allowed;
  }
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
  font-size: ${fontSizeBase};
  color: ${colorText};
`;

export const UserCount = styled.span`
  color: ${colorGray};
  font-weight: 400;
  font-size: ${fontSizeBase};
`;

export const UsersList = styled.div`
  max-height: 12rem;
  overflow-y: auto;
  padding: 0 0.75rem 0.5rem;
`;

export const UserItem = styled.div`
  padding: 0.3rem 0.25rem;
  font-size: ${fontSizeBase};
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
  font-size: ${fontSizeBase};
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
  font-size: ${fontSizeBase};
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
  font-size: ${fontSizeBase};
  color: ${colorGray};
  white-space: nowrap;
  flex-shrink: 0;

  & > i {
    color: ${colorPrimary};
    font-size: ${fontSizeBase};
  }
`;

export const RoomCardMenuWrapper = styled.div`
  position: relative;
  flex-shrink: 0;

  button {
    color: ${colorGray};
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
  font-size: ${fontSizeBase};
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
  font-size: ${fontSizeBase};
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
  Separator,
  ScrollContent,
  TimerSection,
  TimerLabel,
  TimeInputGroup,
  TimeUnitContainer,
  TimerInput,
  TimeUnitLabel,
  InputArrows,
  InputArrowButton,
  InputArrowButtonDown,
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
