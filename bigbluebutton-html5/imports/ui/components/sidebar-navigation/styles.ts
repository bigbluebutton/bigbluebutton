import styled from 'styled-components';
import { ListItemProps } from './types';
import {
  borderSize,
  navigationSidebarBorderRadius,
  navigationSidebarListItemsContainerGap,
  navigationSidebarListItemsGap,
  navigationSidebarListItemsWidth,
  navigationSidebarPaddingY,
  navigationSidebarMargin,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorGrayDark,
  colorGrayLight,
  colorWhite,
  colorDanger,
  colorPrimary,
  listItemBgHover,
  itemFocusBorder,
  colorGrayIcons,
  colorBackground,
} from '/imports/ui/stylesheets/styled-components/palette';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import Button from '/imports/ui/components/common/button/component';

const smallHeight = '(max-height: 40em)';

const NavigationSidebarBackdrop = styled.div<{animations: boolean, isMobile: boolean, isExpanded: boolean}>`
  position: absolute;

  ${({ isMobile }) => !isMobile && `
    background-color: ${colorBackground};
    padding: ${navigationSidebarMargin};
  `}
  ${({ isMobile, animations }) => isMobile && `
    background-color: transparent;
    ${animations && 'transition: height 0.2s ease-out, background-color 0.4s ease-out;'}
  `}
`;

const NavigationSidebar = styled.div<{animations: boolean, isMobile: boolean, isExpanded: boolean}>`
  background-color: ${colorWhite};
  border-radius: ${navigationSidebarBorderRadius};
  display: flex;
  flex-direction: column;
  height: 100%;

  ${({ isMobile, isExpanded, animations }) => (isMobile ? `
    gap: 1rem;
    padding-bottom: ${navigationSidebarPaddingY};
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
    ${!isExpanded && 'background-color: transparent;'}
    ${animations && 'transition: background-color 0.2s ease-out;'}
  ` : `
    padding: ${navigationSidebarPaddingY} 0;
  `)}
`;

// @ts-ignore - js component
const NavigationToggleButton = styled(Button)`
  margin: 0;
  z-index: 3;
  align-self: center;
  ${({ hasNotification }) => hasNotification && `
    position: relative;

    &:after {
      content: '';
      position: absolute;
      border-radius: 50%;
      width: 12px;
      height: 12px;
      bottom: ${borderSize};
      right: 3px;
      background-color: ${colorDanger};
      border: ${borderSize} solid ${colorGrayDark};
    }
  `}
`;

const NavigationSidebarListItemsContainer = styled(ScrollboxVertical)<{
  animations: boolean,
  isMobile: boolean,
  noVirtualScrollboxBackground: boolean,
  isExpanded: boolean,
  enableScrollBar: boolean,
}>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
  border-radius: ${navigationSidebarBorderRadius};
  gap: ${navigationSidebarListItemsContainerGap};
  @media ${smallHeight} {
    gap: 1.25rem;
  }

  ${({ isExpanded }) => (isExpanded ? `
    max-height: 100%;
    opacity: 1;
  ` : `
    height: 0;
    opacity: 0;
    background: transparent !important;
  `)}

  ${({ noVirtualScrollboxBackground }) => noVirtualScrollboxBackground && `
    background: transparent !important;
  `}

  ${({ isMobile, animations }) => (animations && isMobile && `
    transition: height 0.2s ease-out,
     opacity 0.2s ease-out,
     background 0.2s ease-out;
  `)}

  ${({ enableScrollBar }) => !enableScrollBar && `
    overflow: hidden;
  `}
`;

const PositionedDiv = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${navigationSidebarListItemsGap};

  @media ${smallHeight} {
    gap: 0.4rem;
  }
`;

const Top = styled(PositionedDiv)`
  flex-grow: 0;
`;

const Center = styled(PositionedDiv)`
  flex-grow: 1;
`;

const Bottom = styled(PositionedDiv)`
  justify-content: flex-end;
`;

const ListItem = styled.div<ListItemProps>`
  position: relative;
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: center;
  align-self: center;
  text-decoration: none;
  color: ${colorGrayIcons};
  cursor: pointer;
  width: ${navigationSidebarListItemsWidth};
  aspect-ratio: 1 / 1;
  border-radius: 50%;

  > i {
    font-size: 175%;
    color: ${colorGrayLight};

    @media ${smallHeight} {
      font-size: 125%;
    }
  }

  &:hover {
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
    background-color: ${listItemBgHover};
  }

  &:active,
  &:focus {
    outline: transparent;
    outline-width: ${borderSize};
    outline-style: solid;
    background-color: ${listItemBgHover};
    box-shadow: inset 0 0 0 ${borderSize} ${itemFocusBorder}, inset 1px 0 0 1px ${itemFocusBorder};
  }
  
  ${({ active }: ListItemProps) => active && `
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
    color: ${colorWhite};
    background-color: ${colorPrimary} !important;
    > i {
      color: ${colorWhite} !important;
    }
  `}

  ${({ hasNotification }: ListItemProps) => hasNotification && `
    &:after {
      content: '';
      position: absolute;
      border-radius: 50%;
      width: 12px;
      height: 12px;
      bottom: ${borderSize};
      right: 3px;
      background-color: ${colorDanger};
      border: ${borderSize} solid ${colorGrayDark};
    }
  `}

  :disabled {
    border: none;
  }
`;

export default {
  NavigationSidebarBackdrop,
  NavigationSidebar,
  NavigationToggleButton,
  NavigationSidebarListItemsContainer,
  Top,
  Center,
  Bottom,
  ListItem,
};
