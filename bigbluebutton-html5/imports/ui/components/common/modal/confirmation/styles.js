import styled from 'styled-components';
import ModalFooterButton from '/imports/ui/components/common/modal/footer-button/component';
import { jumboPaddingY } from '/imports/ui/stylesheets/styled-components/general';
import { colorGray } from '/imports/ui/stylesheets/styled-components/palette';
import { lineHeightBase } from '/imports/ui/stylesheets/styled-components/typography';

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  padding: 0;
  margin: 0;
`;

const Description = styled.div`
  text-align: start;
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

// The buttons keep their own width and stay at the end of the row; when the
// pair does not fit (a long label on a phone), the row wraps instead of
// stretching them across the dialog.
const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
`;

// A label wider than the whole line wraps instead of overflowing.
const FooterButton = styled(ModalFooterButton)`
  white-space: normal;
`;

const Label = styled.label`
  display: block;
`;

export default {
  Container,
  Description,
  DescriptionText,
  Checkbox,
  Footer,
  FooterButton,
  Label,
};
