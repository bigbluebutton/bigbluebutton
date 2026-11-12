import styled from 'styled-components';
import ModalFooterButton from '/imports/ui/components/common/modal/footer-button/component';
import { $2xlPadding } from '/imports/ui/stylesheets/styled-components/general';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
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

// On a phone the pair always stacks full width, whatever the label length,
// so short and long translations get the same layout.
const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${$2xlPadding};
  width: 100%;

  @media ${smallOnly} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FooterButton = styled(ModalFooterButton)`
  @media ${smallOnly} {
    white-space: normal;
  }
`;

export default {
  Text,
  IgnoreText,
  Footer,
  FooterButton,
};
