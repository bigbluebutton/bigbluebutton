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
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeSmall,
} from '/imports/ui/stylesheets/styled-components/typography';
import Button from '/imports/ui/components/common/button/component';
import {
  HeaderContainer as BaseHeaderContainer,
  Separator as BaseSeparator,
  PanelContent as BasePanelContent,
} from '/imports/ui/components/sidebar-content/styles';

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
  font-size: ${fontSizeSmall};
  color: ${colorText};
  margin-bottom: 0.25rem;
`;

const TimerDisplay = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${colorText};
  font-variant-numeric: tabular-nums;
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
  font-size: ${fontSizeSmall};
  color: ${colorText};
  margin: 0;
  text-align: center;
`;

const ContentArea = styled.div`
  flex-grow: 1;
  min-height: 0;
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
  BottomBar,
  CallModeratorBtn,
  ReturnBtn,
};
