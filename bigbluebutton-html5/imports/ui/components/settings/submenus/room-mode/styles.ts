import styled from 'styled-components';
import { colorBorder } from '/imports/ui/stylesheets/styled-components/palette';
import {
  borderRadiusRounded,
  mdPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase, fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';
import RoomModeStyled from '/imports/ui/components/pre-flight/room-mode/styles';
import SummaryStyled from '/imports/ui/components/pre-flight/room-mode/summary/styles';

// The settings window's type scale, not the pre-flight's: labels at the base
// size, as the other tabs set them, and their help a step below.
const Tab = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${mdPaddingX};

  ${SummaryStyled.Controls} label,
  ${SummaryStyled.Controls} [id$='-label'] {
    font-size: ${fontSizeBase};
  }

  ${SummaryStyled.Controls} [id$='-helper'] {
    font-size: ${fontSizeSmall};
  }
`;

// The design's card around a mode's settings, under the tab's heading.
const SummaryCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${mdPaddingX};
  padding: ${mdPaddingX};
  border: 1px solid ${colorBorder};
  border-radius: ${borderRadiusRounded};

  & > h4:focus {
    outline: none;
  }
`;

const SelectedName = styled(RoomModeStyled.SelectedName)`
  font-size: ${fontSizeBase};
`;

// The design's pair under a mode's settings: Back, then Apply changes.
const Actions = styled.div`
  display: flex;
  gap: ${mdPaddingX};
  padding-top: ${mdPaddingX};
  border-top: 1px solid ${colorBorder};

  & > * {
    flex: 1;
  }
`;

export default {
  Tab,
  SummaryCard,
  SelectedName,
  Actions,
};
