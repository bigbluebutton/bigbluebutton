import styled from 'styled-components';
import {
  borderSize,
  borderSizeSmall,
  navigationSidebarListItemsWidth,
  navigationSidebarListItemsWidthDesktop,
  navigationSidebarIconSize,
  navigationSidebarIconSizeSmallHeight,
  navigationSidebarNotificationBadgeSize,
  navigationSidebarNotificationBadgeFontSize,
  navigationSidebarNotificationBadgeBottom,
  navigationSidebarNotificationBadgeRight,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorWhite,
  notificationBadgeBg,
  colorPrimary,
  listItemBgHover,
  itemFocusBorder,
  colorGrayIcons,
  colorGrayLightest,
} from '/imports/ui/stylesheets/styled-components/palette';
import { ListItemProps } from './types';

const smallHeight = '(max-height: 40em)';

export const ListItem = styled.div<ListItemProps>`
  position: relative;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  align-self: center;
  text-decoration: none;
  color: ${colorGrayIcons};
  cursor: pointer;
  /* The fixed desktop size is in rem, so it follows the user font-size setting.
     Cap it at 100% (the scrollbox content box, which is the rail minus the
     reserved scrollbar gutter) so a larger font scales the icon up but never
     overflows the content box. */
  width: min(${navigationSidebarListItemsWidthDesktop}, 100%);
  aspect-ratio: 1 / 1;
  border-radius: 50%;

  ${({ $isMobile }: ListItemProps) => $isMobile && `
    width: ${navigationSidebarListItemsWidth};
  `}

  > i {
    font-size: ${navigationSidebarIconSize};
    color: ${colorGrayIcons};

    @media ${smallHeight} {
      font-size: ${navigationSidebarIconSizeSmallHeight};
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

  ${({ $active }: ListItemProps) => $active && `
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
    color: ${colorWhite};
    background-color: ${colorPrimary} !important;
    > i {
      color: ${colorWhite} !important;
    }
  `}

  ${({ $hasNotification, $hasPrivateNotification }: ListItemProps) => $hasNotification && !$hasPrivateNotification && `
    &:after {
      content: '';
      position: absolute;
      border-radius: 50%;
      width: ${navigationSidebarNotificationBadgeSize};
      height: ${navigationSidebarNotificationBadgeSize};
      bottom: ${navigationSidebarNotificationBadgeBottom};
      right: ${navigationSidebarNotificationBadgeRight};
      background-color: ${notificationBadgeBg};
      border: ${borderSizeSmall} solid ${colorWhite};
    }
  `}

  ${({ $hasPrivateNotification }: ListItemProps) => $hasPrivateNotification && `
    &:after {
      content: '@';
      position: absolute;
      border-radius: 50%;
      width: ${navigationSidebarNotificationBadgeSize};
      height: ${navigationSidebarNotificationBadgeSize};
      bottom: ${navigationSidebarNotificationBadgeBottom};
      right: ${navigationSidebarNotificationBadgeRight};
      background-color: ${notificationBadgeBg};
      border: ${borderSizeSmall} solid ${colorWhite};
      color: ${colorWhite};
      font-size: ${navigationSidebarNotificationBadgeFontSize};
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
  `}

  ${({ $disabled }) => $disabled && `
    cursor: not-allowed;
    border: none;
    background-color: ${colorGrayLightest};
  `}

  ${({ $locked }) => $locked && `
    cursor: normal;
    border: none;
    background-color: ${colorGrayLightest};
  `}

  :disabled {
    border: none;
  }
`;

export default {
  ListItem,
};
