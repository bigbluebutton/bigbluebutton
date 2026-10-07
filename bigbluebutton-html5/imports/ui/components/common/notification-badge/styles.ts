import styled from 'styled-components';
import {
  borderSizeSmall,
  navigationSidebarNotificationBadgeSize,
  navigationSidebarNotificationBadgeFontSize,
  navigationSidebarNotificationBadgeBottom,
  navigationSidebarNotificationBadgeRight,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorWhite,
  notificationBadgeBg,
} from '/imports/ui/stylesheets/styled-components/palette';

const notificationBadgeShape = `
  min-width: ${navigationSidebarNotificationBadgeSize};
  height: ${navigationSidebarNotificationBadgeSize};
  border-radius: ${navigationSidebarNotificationBadgeSize};
  background-color: ${notificationBadgeBg};
  border: ${borderSizeSmall} solid ${colorWhite};
`;

const notificationBadgeText = `
  color: ${colorWhite};
  font-size: ${navigationSidebarNotificationBadgeFontSize};
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
`;

const notificationBadgeAnchor = `
  position: absolute;
  bottom: ${navigationSidebarNotificationBadgeBottom};
  right: ${navigationSidebarNotificationBadgeRight};
`;

const NotificationBadge = styled.div<{ $anchored?: boolean }>`
  ${notificationBadgeShape}
  ${notificationBadgeText}
  padding: 0 3px;
  flex-shrink: 0;
  white-space: nowrap;

  ${({ $anchored }) => $anchored && notificationBadgeAnchor}
`;

export {
  notificationBadgeShape,
  notificationBadgeText,
  notificationBadgeAnchor,
};

export default {
  NotificationBadge,
};
