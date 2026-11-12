import styled from 'styled-components';
import ModalFooterButton from '/imports/ui/components/common/modal/footer-button/component';
import { $2xlPadding } from '/imports/ui/stylesheets/styled-components/general';
import {
  titlesFontWeight,
  textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';

const Text = styled.div`
  font-weight: ${titlesFontWeight};
  margin-bottom: 0.25rem;
`;

const IgnoreText = styled.div`
  font-weight: ${textFontWeight};
`;

// The buttons keep their own width and stay at the end of the row; when the
// pair does not fit (a long label on a phone), the row wraps instead of
// stretching them across the dialog.
const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${$2xlPadding};
  width: 100%;
`;

// A label wider than the whole line wraps instead of overflowing.
const FooterButton = styled(ModalFooterButton)`
  white-space: normal;
`;

export default {
  Text,
  IgnoreText,
  Footer,
  FooterButton,
};
