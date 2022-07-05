import styled from 'styled-components';

import {
  toolbarButtonWidth,
  toolbarButtonHeight,
  toolbarItemOutlineOffset,
  toolbarButtonBorder,
  toolbarButtonBorderRadius,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  toolbarButtonBorderColor,
  toolbarListColor,
  toolbarButtonColor,
  toolbarListBg,
  toolbarListBgFocus,
} from '/imports/ui/stylesheets/styled-components/palette';
import { toolbarButtonFontSize } from '/imports/ui/stylesheets/styled-components/typography';
import Button from '/imports/ui/components/common/button/component';

const ButtonWrapper = styled.div`
  width: ${toolbarButtonWidth};
  min-width: ${toolbarButtonWidth};
  height: ${toolbarButtonHeight};
  min-height: ${toolbarButtonHeight};
  position: relative;

  & > button {
    outline-offset: ${toolbarItemOutlineOffset};
    border-bottom: ${toolbarButtonBorder} solid ${toolbarButtonBorderColor};
  }

  &:first-child > button {
    border-top-left-radius: ${toolbarButtonBorderRadius};
    border-bottom-left-radius: ${toolbarButtonBorderRadius};

    [dir="rtl"] & {
      border-top-right-radius: ${toolbarButtonBorderRadius};
      border-bottom-right-radius: ${toolbarButtonBorderRadius};
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
`;

const SubmenuButton = styled(Button)`
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
  border-color: ${toolbarButtonBorderColor};
  background-color: ${toolbarListBg};

  &:focus,
  &:hover {
    border: 0;
  }

  & > i {
    color: ${toolbarListColor};
  }

  ${({ state }) => state === 'selected' && `
    background-color: ${toolbarListColor} !important;
    background:red;

    & > i {
      color: ${toolbarListBgFocus} !important;
    }

    & > svg {
      fill: ${toolbarListBgFocus};
    }
  `}
`;

export default {
  ButtonWrapper,
  SubmenuButton,
};
