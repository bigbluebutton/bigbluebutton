import styled from 'styled-components';
import Popover from '@mui/material/Popover';
import {
  borderRadiusDefault,
  colorBackgroundWhite,
  colorBorderDefault,
  spacingLarge,
  spacingMedium,
  spacingXLarge,
} from '@bigbluebutton/bbb-ui-components-react';

const Anchor = styled.div`
  position: relative;
`;

// The library has no popover, so this is an MUI Popover dressed with the library's tokens.
const Panel = styled(Popover)`
  & .MuiPopover-paper {
    width: 24.75rem;
    max-width: calc(100vw - 2rem);
    margin-top: -${spacingXLarge};
    background: ${colorBackgroundWhite};
    border: 1px solid ${colorBorderDefault};
    border-radius: ${borderRadiusDefault};
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacingMedium} ${spacingMedium} ${spacingMedium} ${spacingLarge};

  h2 {
    margin: 0;
  }
`;

const Content = styled.div`
  padding: ${spacingLarge};
`;

export default {
  Anchor,
  Panel,
  Header,
  Content,
};
