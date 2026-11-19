import styled from 'styled-components';
import ConfirmationModalStyles from '/imports/ui/components/common/modal/confirmation/styles';
import { colorBackground } from '/imports/ui/stylesheets/styled-components/palette';

const Parent = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${colorBackground};
`;

const { Description, Footer, FooterButton } = ConfirmationModalStyles;

export default {
  Parent,
  Description,
  Footer,
  FooterButton,
};
