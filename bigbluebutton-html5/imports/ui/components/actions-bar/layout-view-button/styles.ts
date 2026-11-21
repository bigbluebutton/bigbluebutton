import styled from 'styled-components';
import Popover from '@mui/material/Popover';
import { spacingXLarge } from '@bigbluebutton/bbb-ui-components-react';
import { appsGalleryOutlineColor, colorWhiteSurface } from '/imports/ui/stylesheets/styled-components/palette';
import { lgBorderRadius } from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase, headingsFontWeight } from '/imports/ui/stylesheets/styled-components/typography';

const Anchor = styled.div`
  position: relative;
`;

// Dressed like the media-sharing panel next to it in the actions bar.
const Panel = styled(Popover)`
  & .MuiPopover-paper {
    width: 26.25rem;
    max-width: calc(100vw - 2rem);
    margin-top: -${spacingXLarge};
    background: ${colorWhiteSurface};
    border-radius: ${lgBorderRadius};
    box-shadow: -4px 4px 8px 0px rgba(0, 0, 0, 0.25);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid ${appsGalleryOutlineColor};

  h2 {
    margin: 0;
    font-size: ${fontSizeBase};
    font-weight: ${headingsFontWeight};
    text-transform: uppercase;
  }
`;

const Content = styled.div`
  padding: 1rem;
`;

export default {
  Anchor,
  Panel,
  Header,
  Content,
};
