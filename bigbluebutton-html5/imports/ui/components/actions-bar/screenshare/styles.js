import styled from 'styled-components';
import Modal from '/imports/ui/components/common/modal/simple/component';
import { colorGrayDark } from '/imports/ui/stylesheets/styled-components/palette';
import {
  jumboPaddingY,
  minModalHeight,
  headingsFontWeight,
  mdPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeLarge } from '/imports/ui/stylesheets/styled-components/typography';

const ScreenShareModal = styled(Modal)`
  padding: ${jumboPaddingY};
  min-height: ${minModalHeight};
  text-align: center;
`;

const Title = styled.h3`
  font-weight: ${headingsFontWeight};
  font-size: ${fontSizeLarge};
  color: ${colorGrayDark};
  white-space: normal;
  padding-bottom: ${mdPaddingX};
`;

export default {
  ScreenShareModal,
  Title,
};
