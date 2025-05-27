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

const smallHeight = '(max-height: 40em)';

const NavigationSidebarBackdrop = styled.div<{isMobile: boolean}>`
  position: absolute;
  background-color: ${({ isMobile }) => (!isMobile ? `${colorBackground}` : 'transparent')};
  ${({ isMobile }) => !isMobile && `padding: ${navigationSidebarMargin}`};
`;

const NavigationSidebar = styled.div<{isMobile: boolean}>`
  background-color: ${colorWhite};
  border-radius: ${navigationSidebarBorderRadius};
  padding: ${navigationSidebarPaddingY} 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  ${({ isMobile }) => isMobile && 'box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2)'};
`;

const NavigationSidebarListItemsContainer = styled(ScrollboxVertical)<{hasScrollbar: boolean}>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
  overflow-y: auto;
  border-radius: ${navigationSidebarBorderRadius};
  gap: ${navigationSidebarListItemsContainerGap};
  ${({ hasScrollbar }) => !hasScrollbar && 'background: transparent !important;'}

  @media ${smallHeight} {
    gap: 1.25rem;
  }
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
  NavigationSidebarListItemsContainer,
  Top,
  Center,
  Bottom,
  ListItem,
};
