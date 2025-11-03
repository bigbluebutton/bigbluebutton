import React, { memo } from 'react';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import Icon from '/imports/ui/components/common/icon/component';
import { InjectedAppGalleryItem } from '/imports/ui/components/layout/layoutTypes';
import { PinnedAppProps } from '../types';
import Styled from '../styles';

const PinnedAppBase: React.FC<PinnedAppProps> = ({
  appKey,
  appInfo,
  active,
  onActivate,
  children,
}) => {
  const { name, icon, hasNotification } = appInfo;
  // type guard
  const { onClick } = (appInfo as InjectedAppGalleryItem);

  return (
    <TooltipContainer
      title={name}
      position="right"
      key={appKey}
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
  );
};

export default memo(PinnedAppBase);
