import styled from 'styled-components';
import {
  smPaddingY,
  smPaddingX,
  lgPaddingX,
  jumboPaddingY,
  descriptionMargin,
} from '/imports/ui/stylesheets/styled-components/general';
import { colorGray } from '/imports/ui/stylesheets/styled-components/palette';
import { lineHeightBase } from '/imports/ui/stylesheets/styled-components/typography';
import Modal from '/imports/ui/components/common/modal/simple/component';
import Button from '/imports/ui/components/common/button/component';

const EndMeetingModal = styled(Modal)`
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

const Description = styled.div`
  text-align: center;
  line-height: ${lineHeightBase};
  color: ${colorGray};
  margin-bottom: ${jumboPaddingY};
`;

const Footer = styled.div`
  display:flex;
`;

const EndMeetingButton = styled(Button)`
  padding-right: ${jumboPaddingY};
  padding-left: ${jumboPaddingY};
  margin: 0 ${smPaddingX} 0 0;

  [dir="rtl"] & {
    margin: 0 0 0 ${smPaddingX};
  }
`;

export default {
  EndMeetingModal,
  Container,
  Description,
  Footer,
  EndMeetingButton,
};
