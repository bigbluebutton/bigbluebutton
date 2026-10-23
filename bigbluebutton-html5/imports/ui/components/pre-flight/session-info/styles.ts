import styled from 'styled-components';
import { colorTextDefault } from '@bigbluebutton/bbb-ui-components-react';
import { colorText } from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeBase,
  fontSizeLarger,
  headingsFontWeight,
  textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';

const SessionInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  max-width: 19.75rem;
`;

// The design's #717C91 is 4.2:1 on white, under WCAG AA at 16px, so the age
// takes the description's colour instead.
const SessionAge = styled.div`
  color: ${colorText};
  font-size: ${fontSizeBase};
  font-weight: ${textFontWeight};
  line-height: 1.375rem;
`;

const SessionName = styled.div`
  max-width: 100%;
  overflow-wrap: anywhere;
  color: ${colorTextDefault};
  font-size: ${fontSizeLarger};
  font-weight: ${headingsFontWeight};
  line-height: 2.0625rem;
`;

export default {
  SessionInfo,
  SessionAge,
  SessionName,
};
