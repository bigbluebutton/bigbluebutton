import styled from 'styled-components';
import ButtonWrappers from '/imports/ui/components/common/button-wrapper/styles';
import { jumboPaddingY, lgPaddingY } from '/imports/ui/stylesheets/styled-components/general';
import { mediumOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import PreFlightStyled from '../styles';

const Footer = styled.div`
  ${PreFlightStyled.cardFooter}
  gap: ${jumboPaddingY};

  /* Across a tablet's width the card's padding turns the button into a tall
     band: a slimmer row there, at the card's foot. */
  ${PreFlightStyled.PHONE_LAYOUT} & {
    @media ${mediumOnly} {
      padding: ${lgPaddingY} ${jumboPaddingY};
    }
  }
`;

// An equal share of the row: the whole of it while it is the only button.
const SettingsButtonWrapper = ButtonWrappers.FullWidthFlexItem;

export default {
  Footer,
  SettingsButtonWrapper,
};
