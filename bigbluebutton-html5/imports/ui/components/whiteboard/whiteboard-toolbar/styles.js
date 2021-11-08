import styled from 'styled-components';

import {
  toolbarListColor,
  toolbarListBgFocus,
  colorDanger,
  colorWhite,
  colorGrayDark,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  toolbarButtonWidth,
  toolbarButtonHeight,
  lgPaddingX,
  borderSizeLarge,
  smPaddingX,
  toolbarMargin,
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

export default {
  TextThickness,
  CustomSvgIcon,
  MultiUserTool,
  ToolbarContainer,
};
