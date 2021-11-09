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

  @keyframes fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  .permissionsOverlay {
    position: fixed;
    z-index: 1002;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, .85);
    animation: fade-in .5s ease-in;
  }
`;
 
export default GlobalStyle;
