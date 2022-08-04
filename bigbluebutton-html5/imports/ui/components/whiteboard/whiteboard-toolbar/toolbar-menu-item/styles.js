import styled from 'styled-components';

import {
  toolbarButtonWidth,
  toolbarButtonHeight,
  toolbarButtonBorderRadius,
  toolbarItemTrianglePadding,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  toolbarButtonBorderColor,
  toolbarListColor,
  toolbarButtonColor,
  toolbarButtonBg,
  toolbarListBg,
} from '/imports/ui/stylesheets/styled-components/palette';
import { toolbarButtonFontSize } from '/imports/ui/stylesheets/styled-components/typography';
import Button from '/imports/ui/components/common/button/component';

const ButtonWrapper = styled.div`
  width: ${toolbarButtonWidth};
  min-width: ${toolbarButtonWidth};
  height: ${toolbarButtonHeight};
  min-height: ${toolbarButtonHeight};
  position: relative;

  ${({ showCornerTriangle }) => showCornerTriangle && `
    &::before {
      content: '';
      position: absolute;
      border-color: transparent;
      border-style: solid;
      z-index: 2;
      border-radius: 0;
      border-width: 0.35em;
      bottom: ${toolbarItemTrianglePadding};
      left: ${toolbarItemTrianglePadding};
      border-left-color: ${toolbarListColor};
      border-bottom-color: ${toolbarListColor};

      [dir="rtl"] & {
        left: auto;
        right: ${toolbarItemTrianglePadding};

        border-left-color: transparent;
        border-right-color: ${toolbarListColor};
      }
    }
  `}
`;

const ToolbarButton = styled(Button)`
  padding: 0;
  border: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center !important;
  justify-content: center !important;
  position: relative;
  border-radius: 0;
  box-shadow: none !important;
  z-index: 1;
  font-size: ${toolbarButtonFontSize};
  color: ${toolbarButtonColor};
  background-color: ${toolbarButtonBg};
  border-color: ${toolbarButtonBorderColor};

  &:focus,
  &:hover {
    border: 0;
  }

  & > i {
    color: ${toolbarButtonColor};
  }

  ${({ state }) => state === 'active' && `
    background-color: ${toolbarListBg};

    & > i {
      color: ${toolbarListColor};
    }
  `}
`;

export default {
  ButtonWrapper,
  ToolbarButton,
};
