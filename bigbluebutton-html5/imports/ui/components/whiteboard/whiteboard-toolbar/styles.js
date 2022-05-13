import styled from 'styled-components';

import {
  toolbarListColor,
  toolbarListBgFocus,
  colorDanger,
  colorWhite,
  colorGrayDark,
  toolbarButtonBorderColor,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  toolbarButtonWidth,
  toolbarButtonHeight,
  lgPaddingX,
  borderSizeLarge,
  smPaddingX,
  toolbarMargin,
  toolbarButtonBorderRadius,
  toolbarItemOutlineOffset,
  toolbarButtonBorder,
} from '/imports/ui/stylesheets/styled-components/general';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const TextThickness = styled.p`
  font-family: Arial, sans-serif;
  font-weight: normal;
  text-shadow: -1px 0 ${toolbarListBgFocus}, 0 1px ${toolbarListBgFocus}, 1px 0 ${toolbarListBgFocus}, 0 -1px ${toolbarListBgFocus};
  margin: auto;
  color: ${toolbarListColor};
`;

const CustomSvgIcon = styled.svg`
  position: absolute;
  width: ${toolbarButtonWidth};
  height: ${toolbarButtonHeight};
  left: 0;
  top: 0;
`;

const MultiUserTool = styled.span`
  background-color: ${colorDanger};
  border-radius: 50%;
  width: ${lgPaddingX};
  height: ${lgPaddingX};
  position: absolute;
  z-index: 2;
  right: 0px;
  color: ${colorWhite};
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 1px 1px ${borderSizeLarge} ${colorGrayDark};
  font-size: ${smPaddingX};
`;

const ToolbarContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 ${toolbarMargin} 0 0;
  position: absolute;
  top: 0;
  right: 0;
  left: auto;
  bottom: 0;
  pointer-events: none;
  z-index: 3;

  [dir="rtl"] & {
    margin: 0 0 0 ${toolbarMargin};
    right: auto;
    left: 0;
  }

  @media ${smallOnly} {
    transform: scale(.75);
    transform-origin: right;
  }
`;

const ToolbarWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px -2px rgba(0, 0, 0, .25);
  border-radius: 5px;
  pointer-events: all;

  .toolbarButtonWrapper > button {
    outline-offset: ${toolbarItemOutlineOffset};
    border-bottom: ${toolbarButtonBorder} solid ${toolbarButtonBorderColor};
  }

  & > .toolbarButtonWrapper:first-child > button {
    border-top-left-radius: ${toolbarButtonBorderRadius};
    border-top-right-radius: ${toolbarButtonBorderRadius};

    &.toolbarActive {
      border-top-left-radius: 0;
      border-top-right-radius: ${toolbarButtonBorderRadius};

      [dir="rtl"] & {
        border-top-left-radius: ${toolbarButtonBorderRadius};
        border-top-right-radius: 0;
      }
    }
  }

  .toolbarButtonWrapper:last-child > button {
    border-bottom: 0;
    border-bottom-left-radius: ${toolbarButtonBorderRadius};
    border-bottom-right-radius: ${toolbarButtonBorderRadius};

    &.toolbarActive {
      border-bottom-left-radius: 0;
      border-top-right-radius: ${toolbarButtonBorderRadius};

      [dir="rtl"] & {
        border-bottom-left-radius: ${toolbarButtonBorderRadius};
        border-top-right-radius: 0;
      }
    }
  }
`;

export default {
  TextThickness,
  CustomSvgIcon,
  MultiUserTool,
  ToolbarContainer,
  ToolbarWrapper,
};
