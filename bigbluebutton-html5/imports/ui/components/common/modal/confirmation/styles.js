import styled from 'styled-components';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import {
  lgPaddingY,
  jumboPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import { colorGray } from '/imports/ui/stylesheets/styled-components/palette';
import { lineHeightBase } from '/imports/ui/stylesheets/styled-components/typography';

const ConfirmationModal = styled(ModalSimple)``;

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  padding: 0;
  margin: 0;
`;

const Description = styled.div`
  text-align: left;
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
  display: flex;
  gap: 0.75rem;
  margin-bottom: ${lgPaddingY};
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
  Label,
};
