import styled from 'styled-components';
import ButtonWrappers from '/imports/ui/components/common/button-wrapper/styles';
import { jumboPaddingY } from '/imports/ui/stylesheets/styled-components/general';
import PreFlightStyled from '../styles';

const Footer = styled.div`
  ${PreFlightStyled.cardFooter}
  gap: ${jumboPaddingY};
`;

// An equal share of the row: the whole of it while it is the only button.
const SettingsButtonWrapper = ButtonWrappers.FullWidthFlexItem;

export default {
  Footer,
  SettingsButtonWrapper,
};
