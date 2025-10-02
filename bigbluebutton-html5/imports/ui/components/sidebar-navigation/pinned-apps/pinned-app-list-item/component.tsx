import React, { memo } from 'react';
import { InjectedAppGalleryItem } from '/imports/ui/components/layout/layoutTypes';
import { PinnedAppProps } from '../types';
import SidebarNavigationButton from '/imports/ui/components/sidebar-navigation/sidebar-navigation-button/component';

const PinnedAppBase: React.FC<PinnedAppProps> = ({
  appKey,
  appInfo,
  isOpened,
  children,
}) => {
  const { name, icon } = appInfo;
  // type guard
  const { onClick } = (appInfo as InjectedAppGalleryItem);

  return (
    <SidebarNavigationButton
      panel={typeof onClick === 'function' ? undefined : appKey}
      isOpened={isOpened}
      iconName={icon}
      label={name}
      id={`pinned-app-${appKey}`}
      ariaDescribedBy={`pinned-app-${appKey}-button`}
      data-test={`${appKey}SidebarButton`}
      onClick={typeof onClick === 'function' ? onClick : undefined}
    >
      {children}
    </SidebarNavigationButton>
  );
};

export default memo(PinnedAppBase);
