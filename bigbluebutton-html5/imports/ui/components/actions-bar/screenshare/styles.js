import styled from 'styled-components';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import { colorGrayDark } from '/imports/ui/stylesheets/styled-components/palette';
import {
  jumboPaddingY,
  minModalHeight,
  headingsFontWeight,
  mdPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeLarge } from '/imports/ui/stylesheets/styled-components/typography';
import SpinnerStyles from '/imports/ui/components/common/loading-screen/styles';

const ScreenShareModal = styled(ModalSimple)`
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

const SpinnerOverlay = styled(SpinnerStyles.Spinner)`
  & > div {
    background-color: white;
    height: 0.5625rem;
    width: 0.5625rem;
  }
`;

const Bounce1 = styled(SpinnerStyles.Bounce1)`
  height: 0.5625rem;
  width: 0.5625rem;
`;

const Bounce2 = styled(SpinnerStyles.Bounce2)`
  height: 0.5625rem;
  width: 0.5625rem;
`;

export default {
  ScreenShareModal,
  Title,
  SpinnerOverlay,
  Bounce1,
  Bounce2,
};
