import styled from 'styled-components';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import { colorGrayDark } from '/imports/ui/stylesheets/styled-components/palette';
import {
  jumboPaddingY,
  minModalHeight,
  mdPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeLarge,
  headingsFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';

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

const Container = styled.span`
  display: flex;
  flex-flow: row;
  position: relative;

  & > div {
    position: relative;
  }

  & > :last-child {
    margin-right: 0;
  }
`;
export default {
  ScreenShareModal,
  Title,
  Container,
};
