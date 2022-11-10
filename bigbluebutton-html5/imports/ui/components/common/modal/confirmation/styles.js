import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import Modal from '/imports/ui/components/common/modal/simple/component';
import {
  smPaddingX,
  mdPaddingX,
  lgPaddingY,
  jumboPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import { colorGray } from '/imports/ui/stylesheets/styled-components/palette';
import { lineHeightBase } from '/imports/ui/stylesheets/styled-components/typography';

const ConfirmationModal = styled(Modal)`
  padding: ${mdPaddingX};
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0;
  margin-top: 0;
  margin: auto;
`;

const Description = styled.div`
  text-align: center;
  line-height: ${lineHeightBase};
  color: ${colorGray};
  margin-bottom: ${jumboPaddingY};
`;

const DescriptionText = styled.span`
  white-space: pre-line;
`;

const Checkbox = styled.input`
  position: relative;
  top: 0.134rem;
  margin-right: 0.5rem;

  [dir="rtl"] & {
    margin-right: 0;
    margin-left: 0.5rem;
  }
`;

const Footer = styled.div`
  display:flex;
  margin-bottom: ${lgPaddingY};
`;

const ConfirmationButton = styled(Button)`
  padding-right: ${jumboPaddingY};
  padding-left: ${jumboPaddingY};
  margin: 0 ${smPaddingX} 0 0;

  [dir="rtl"] & {
    margin: 0 0 0 ${smPaddingX};
  }
`;

const CancelButton = styled(ConfirmationButton)`
  margin: 0;
`;

const Label = styled.label`
  display: block;
`;

export default {
  ConfirmationModal,
  Container,
  Description,
  DescriptionText,
  Checkbox,
  Footer,
  ConfirmationButton,
  CancelButton,
  Label,
};
