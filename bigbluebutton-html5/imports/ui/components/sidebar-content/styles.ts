import styled from 'styled-components';
import {
  colorWhite,
  colorPrimary,
  colorGrayLightest,
  appsPanelTextColor,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  borderSize,
  navbarHeight,
  smPaddingX,
  contentSidebarHeight,
  contentSidebarBorderRadius,
  contentSidebarPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import { smallOnly, mediumUp } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { SidebarContentPanelProps } from './types';
import Header from '../common/control-header/component';
import { textFontWeight } from '../../stylesheets/styled-components/typography';

const Poll = styled.div`
  position: absolute;
  display: flex;
  flex-flow: column;
  overflow-y: auto;
  overflow-x: hidden;
  outline: transparent;
  outline-width: ${borderSize};
  outline-style: solid;
  order: 2;
  height: 100%;
  background-color: ${colorWhite};
  min-width: 20em;
  padding: ${smPaddingX};

  @media ${smallOnly} {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 5;
    height: auto;
    top: ${navbarHeight};
    overflow: auto;
     &.no-padding {
      padding: 0;
    }
  }

  @media ${mediumUp} {
    position: relative;
    order: 1;
  }
`;

export const SidebarContentPanel = styled.div<SidebarContentPanelProps>`
  background-color: ${colorWhite};
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: space-around;
  overflow: hidden;
  height: ${contentSidebarHeight};
  border-radius: ${contentSidebarBorderRadius};
  user-select: none;

  a {
    color: ${colorPrimary};
    text-decoration: none;

    &:focus {
      color: ${colorPrimary};
      text-decoration: underline;
    }
    &:hover {
      filter: brightness(90%);
      text-decoration: underline;
    }
    &:active {
      filter: brightness(85%);
      text-decoration: underline;
    }
    &:hover:focus {
      filter: brightness(90%);
      text-decoration: underline;
    }
    &:focus:active {
      filter: brightness(85%);
      text-decoration: underline;
    }
  }
  u {
    text-decoration-line: none;
  }

  ${({ isChrome }) => isChrome && `
    transform: translateZ(0);
  `}

  @media ${smallOnly} {
    transform: none !important;
  }
`;

export const HeaderContainer = styled(Header)`
  padding: ${contentSidebarPadding};
  padding-bottom: 0.5rem;
`;

export const Separator = styled.hr`
  width: 100%;
  border: 0;
  border-bottom: 1px solid ${colorGrayLightest};
`;

export const PanelContent = styled.div`
  height: 100%;
  color: ${appsPanelTextColor};
  font-weight: ${textFontWeight};
  line-height: normal;
`;

export default {
  Poll,
  SidebarContentPanel,
  HeaderContainer,
  Separator,
  PanelContent,
};
