import styled from 'styled-components';
import { appsPanelTextColor } from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeSmall, textFontWeight } from '/imports/ui/stylesheets/styled-components/typography';

const MeterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
`;

const MeterLabel = styled.span`
  color: ${appsPanelTextColor};
  font-size: ${fontSizeSmall};
  font-weight: ${textFontWeight};
`;

// The slider is only drawn: it takes no pointer, and the meter role around it
// is what assistive tech reads.
const MeterTrack = styled.div`
  pointer-events: none;

  & .MuiSlider-root {
    padding: 0;
  }
`;

export default {
  MeterContainer,
  MeterLabel,
  MeterTrack,
};
