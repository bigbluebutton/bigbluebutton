import styled from 'styled-components';
import ModalFooterButton from '/imports/ui/components/common/modal/footer-button/component';
import { fontSizeLarge } from '/imports/ui/stylesheets/styled-components/typography';

const ActivityModalContent = styled.div`
  flex-direction: column;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  padding: 0;
  margin-top: auto;
  margin-bottom: auto;
  padding: 0.5rem;
  text-align: start;

  & > p {
    font-size: ${fontSizeLarge};
    margin: 0.5em 0;
  }
`;

const FooterButton = ModalFooterButton;

export default {
  ActivityModalContent,
  FooterButton,
};
