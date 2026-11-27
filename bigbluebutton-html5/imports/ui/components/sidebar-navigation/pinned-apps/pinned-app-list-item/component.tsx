import React, { memo } from 'react';
import { InjectedAppGalleryItem } from '/imports/ui/components/layout/layoutTypes';
import { PinnedAppProps } from '../types';
import SidebarNavigationButton from '/imports/ui/components/sidebar-navigation/sidebar-navigation-button/component';

const PinnedAppBase: React.FC<PinnedAppProps> = ({
  appKey,
  appInfo,
  isOpened,
  badgeLabel,
  children,
}) => {
  const {
    name, icon, hasNotification, dataTest,
  } = appInfo;

  // type guard
  const { onClick } = (appInfo as InjectedAppGalleryItem);

  return (
    <SidebarNavigationButton
      panel={typeof onClick === 'function' ? undefined : appKey}
      isOpened={isOpened}
      iconName={icon}
      label={name}
      hasNotification={hasNotification}
      badgeLabel={badgeLabel}
      id={`pinned-app-${appKey}`}
      dataTest={dataTest ? `sidebar_button_${dataTest}` : `${appKey}SidebarButton`}
      onClick={typeof onClick === 'function' ? onClick : undefined}
    >
      {children}
    </SidebarNavigationButton>
  );
};

export default memo(PinnedAppBase);
