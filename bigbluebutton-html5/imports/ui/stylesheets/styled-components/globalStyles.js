import { createGlobalStyle } from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { borderRadius } from '/imports/ui/stylesheets/styled-components/general';
import { dropdownBg } from '/imports/ui/stylesheets/styled-components/palette';

const GlobalStyle = createGlobalStyle`
  @media ${smallOnly} {
    .MuiPaper-root.MuiMenu-paper.MuiPopover-paper {
      top: 0 !important;
      left: 0 !important;
      bottom: 0 !important;
      right: 0 !important;
      max-width: none;
    }
  }

  .MuiPaper-root {
    background-color: ${dropdownBg};
    border-radius: ${borderRadius};
    border: 0;
    z-index: 9999;
    max-width: 16rem;
  } 
`;
 
export default GlobalStyle;
