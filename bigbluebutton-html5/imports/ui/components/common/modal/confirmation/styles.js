import styled from 'styled-components';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import {
  mdPaddingX,
  lgPaddingY,
  jumboPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import { colorGray } from '/imports/ui/stylesheets/styled-components/palette';
import { lineHeightBase } from '/imports/ui/stylesheets/styled-components/typography';

const ConfirmationModal = styled(ModalSimple)`
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
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: ${lgPaddingY};
`;

// A floor keeps a one-word label ("Pin", "Yes") from rendering as a square
// next to a wider sibling. Once the pair stacks on a phone, each button fills
// its line; side by side the footer shrinks to fit its buttons, so there is no
// room to grow into. Two floors plus a long label can be wider than a phone
// screen, so the label wraps instead of overflowing.
const FooterButton = styled(BBButton)`
  min-width: 8.5rem;
  flex-grow: 1;
  white-space: normal;
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
  FooterButton,
  Label,
};
