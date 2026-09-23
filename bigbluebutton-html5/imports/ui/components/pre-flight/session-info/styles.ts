import styled from 'styled-components';
import { colorGrayDark } from '/imports/ui/stylesheets/styled-components/palette';
import { smPadding } from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeLarger,
  headingsFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';

// The spec's text colours are not implemented: the name follows the heading of
// the screens it sits above, and the pre-flight family moves together.
const SessionInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${smPadding};
  max-width: 19.75rem;
`;

const SessionName = styled.div`
  max-width: 100%;
  overflow-wrap: anywhere;
  color: ${colorGrayDark};
  font-size: ${fontSizeLarger};
  font-weight: ${headingsFontWeight};
  line-height: 2.0625rem;
`;

export default {
  SessionInfo,
  SessionName,
};
