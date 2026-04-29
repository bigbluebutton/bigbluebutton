import styled from 'styled-components';
import {
  contentSidebarPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorPrimary,
  colorWhite,
  colorGrayLighter,
  colorBlueAux,
  colorText,
  colorGray,
  colorBorder,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeSmall,
  fontSizeBase,
} from '/imports/ui/stylesheets/styled-components/typography';
import Button from '/imports/ui/components/common/button/component';
import {
  HeaderContainer as BaseHeaderContainer,
  Separator as BaseSeparator,
  PanelContent as BasePanelContent,
} from '/imports/ui/components/sidebar-content/styles';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';

const HeaderContainer = styled(BaseHeaderContainer)``;

const Separator = styled(BaseSeparator)``;

const PanelContent = styled(BasePanelContent)`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const TimerSection = styled.div`
  text-align: center;
  padding: 0.75rem ${contentSidebarPadding};
  flex-shrink: 0;
`;

const TimerLabel = styled.div`
  font-size: ${fontSizeBase};
  color: ${colorText};
  margin-bottom: 0.25rem;
`;

const TimerDisplay = styled.div`
  font-size: 2.5rem;
  font-weight: 600;
  color: ${colorText};
  font-variant-numeric: tabular-nums;
  display: flex;
  justify-content: center;
  padding: 0.5rem 0 1rem;
  border-bottom: 1px solid ${colorBorder};
  width: 100%;
`;

const InfoCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  background-color: ${colorBlueAux};
  border-radius: 0.5rem;
  padding: 1.25rem 1.5rem;
  margin: 0 ${contentSidebarPadding};
  flex-shrink: 0;

  & > i {
    font-size: 2.5rem;
    color: ${colorPrimary};
  }
`;

const RoomNumberSquare = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  background-color: ${colorPrimary};
  color: ${colorWhite};
  font-size: 1.5rem;
  font-weight: 700;
`;

const InfoText = styled.p`
  font-size: ${fontSizeBase};
  color: ${colorText};
  margin: 0;
  text-align: center;
`;

const ContentArea = styled.div`
  flex-grow: 1;
  min-height: 0;
`;

const FreeJoinScrollArea = styled(ScrollboxVertical)`
  overflow: hidden auto;
  flex-grow: 1;
  min-height: 0;
  padding: 0.5rem ${contentSidebarPadding} 1rem;
`;

const FreeJoinRoomList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
  gap: 0.5rem;
`;

const FreeJoinRoomCard = styled.div<{ $isCurrent?: boolean }>`
  display: flex;
  flex-direction: column;
  border: 1.5px solid ${({ $isCurrent }) => ($isCurrent ? colorPrimary : colorGrayLighter)};
  border-radius: 0.75rem;
  padding: 0.6rem 0.6rem 0.5rem;
  background: ${({ $isCurrent }) => ($isCurrent ? colorBlueAux : 'transparent')};
  gap: 0.5rem;
  min-width: 0;
  overflow: hidden;
`;

const FreeJoinRoomCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const FreeJoinRoomName = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${colorText};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
`;

const FreeJoinRoomCount = styled.span`
  display: flex;
  align-items: center;
  gap: 0.15rem;
  font-size: ${fontSizeSmall};
  color: ${colorGray};
  white-space: nowrap;
  flex-shrink: 0;

  & > i {
    color: ${colorPrimary};
    font-size: 0.85rem;
  }
`;

const FreeJoinRequestBtn = styled.button<{ $isCurrent?: boolean }>`
  background: ${({ $isCurrent }) => ($isCurrent ? colorPrimary : 'transparent')};
  color: ${({ $isCurrent }) => ($isCurrent ? colorWhite : colorPrimary)};
  border: 1px solid ${({ $isCurrent }) => ($isCurrent ? colorPrimary : colorGrayLighter)};
  border-radius: 0.5rem;
  padding: 0.3rem 0.4rem;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  text-align: center;
  line-height: 1.2;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NotAssignedHelpText = styled.p`
  font-size: ${fontSizeBase};
  color: ${colorText};
  margin: 0.5rem ${contentSidebarPadding} 0;
  text-align: center;
`;

const EnterRoomBtn = styled.button`
  background: ${colorPrimary};
  color: ${colorWhite};
  border: none;
  border-radius: 0.75rem;
  padding: 0.45rem 1.25rem;
  font-size: ${fontSizeBase};
  font-weight: 600;
  cursor: pointer;
  width: 100%;

  &:hover {
    opacity: 0.85;
  }
`;

const BottomBar = styled.div`
  padding: 0.75rem ${contentSidebarPadding};
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-shrink: 0;
  border-top: 1px solid ${colorGrayLighter};
`;

// @ts-ignore - as Button comes from JS, we can't provide its props
const CallModeratorBtn = styled(Button)`
  width: 100%;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;

  & > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

// @ts-ignore - as Button comes from JS, we can't provide its props
const ReturnBtn = styled(Button)`
  width: 100%;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: ${colorWhite};
  color: ${colorText};
  border: 1px solid ${colorGrayLighter};
  border-radius: 1rem;

  & > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    background-color: ${colorBlueAux};
  }
`;

export default {
  HeaderContainer,
  Separator,
  PanelContent,
  TimerSection,
  TimerLabel,
  TimerDisplay,
  InfoCard,
  RoomNumberSquare,
  InfoText,
  ContentArea,
  NotAssignedHelpText,
  EnterRoomBtn,
  FreeJoinScrollArea,
  FreeJoinRoomList,
  FreeJoinRoomCard,
  FreeJoinRoomCardHeader,
  FreeJoinRoomName,
  FreeJoinRoomCount,
  FreeJoinRequestBtn,
  BottomBar,
  CallModeratorBtn,
  ReturnBtn,
};
