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
  const { name, icon, hasNotification } = appInfo;
  // type guard
  const { onClick } = (appInfo as InjectedAppGalleryItem);

  return (
    <SidebarNavigationButton
      panel={typeof onClick === 'function' ? undefined : appKey}
      isOpened={isOpened}
      iconName={icon}
      label={name}
      id={`pinned-app-${appKey}`}
      dataTest={`${appKey}SidebarButton`}
      onClick={typeof onClick === 'function' ? onClick : undefined}
    >
      <Styled.ListItem
        role="button"
        tabIndex={0}
        active={active}
        data-test={`${appKey}SidebarButton`}
        onClick={onClick || (() => onActivate(appKey))}
        hasNotification={hasNotification}
      >
        <Icon iconName={icon} />
        {children}
      </Styled.ListItem>
    </TooltipContainer>
      {children}
    </SidebarNavigationButton>
  );
};

export default memo(PinnedAppBase);
