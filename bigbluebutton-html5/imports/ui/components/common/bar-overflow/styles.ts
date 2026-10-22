import { css } from 'styled-components';
import {
  borderSizeSmall,
  navigationSidebarNotificationBadgeSize,
  navigationSidebarNotificationBadgeBottom,
  navigationSidebarNotificationBadgeRight,
} from '/imports/ui/stylesheets/styled-components/general';
import { colorWhite, notificationBadgeBg } from '/imports/ui/stylesheets/styled-components/palette';

// The sidebar's notification dot, on a positioned trigger that holds an active item.
export const activeEntryBadge = css<{ $hasActiveEntry?: boolean }>`
  ${({ $hasActiveEntry }) => $hasActiveEntry && `
    &::after {
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
`;

export default {
  activeEntryBadge,
};
