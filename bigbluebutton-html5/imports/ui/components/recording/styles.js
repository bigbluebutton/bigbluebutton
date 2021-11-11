import styled from 'styled-components';
import {
  smPaddingY,
  smPaddingX,
  lgPaddingX,
  lgPaddingY,
  jumboPaddingY,
  descriptionMargin,
  titlePositionLeft,
} from '/imports/ui/stylesheets/styled-components/general';
import { colorGray, colorGrayDark } from '/imports/ui/stylesheets/styled-components/palette';
import { lineHeightBase, headingsFontWeight } from '/imports/ui/stylesheets/styled-components/typography';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';

const RecordingModal = styled(Modal)`
  padding: ${smPaddingY};
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0;
  margin-top: 0;
  margin-right: ${descriptionMargin};
  margin-left: ${descriptionMargin};
  margin-bottom: ${lgPaddingX};
`;

const Header = styled.div`
  margin: 0;
  padding: 0;
  border: none;
  line-height: ${titlePositionLeft};
  margin-bottom: ${lgPaddingY};
`;

const Title = styled.div`
  color: ${colorGrayDark};
  font-weight: ${headingsFontWeight};
  font-size: ${jumboPaddingY};
`;

const Description = styled.div`
  text-align: center;
  line-height: ${lineHeightBase};
  color: ${colorGray};
  margin-bottom: ${jumboPaddingY};
`;

const Footer = styled.div`
  display:flex;
`;

const RecordingButton = styled(Button)`
  padding-right: ${jumboPaddingY};
  padding-left: ${jumboPaddingY};
  margin: 0 ${smPaddingX} 0 0;

  [dir="rtl"] & {
    margin: 0 0 0 ${smPaddingX};
  }
`;

export default {
  RecordingModal,
  Container,
  Header,
  Title,
  Description,
  Footer,
  RecordingButton,
};
