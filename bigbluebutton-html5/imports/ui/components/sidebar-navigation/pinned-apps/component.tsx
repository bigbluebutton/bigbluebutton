import React, { memo } from 'react';
import {
  Input,
  SidebarNavigation,
} from '/imports/ui/components/layout/layoutTypes';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import { layoutDispatch, layoutSelectInput } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';

interface PinnedAppsProps {
  sidebarNavigationInput: SidebarNavigation;
}

const PinnedApps = ({ sidebarNavigationInput }: PinnedAppsProps) => {
  const { registeredApps = {}, pinnedApps = [] } = sidebarNavigationInput;
  const layoutContextDispatch = layoutDispatch();
  const { sidebarContentPanel } = layoutSelectInput((i: Input) => i.sidebarContent);

  return pinnedApps.map((pinnedAppKey: string) => {
    const pinnedAppInfo = registeredApps[pinnedAppKey];
    const { name, icon } = pinnedAppInfo;
    return (
      <TooltipContainer
        title={name}
        position="right"
        key={pinnedAppKey}
      >
        <Styled.ListItem
          role="button"
          tabIndex={0}
          active={sidebarContentPanel === pinnedAppKey}
          data-test={`${pinnedAppKey}SidebarButton`}
          onClick={() => {
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
              value: sidebarContentPanel !== pinnedAppKey,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
              value: sidebarContentPanel === pinnedAppKey
                ? PANELS.NONE
                : pinnedAppKey,
            });
          }}
        >
          <Icon iconName={icon} />
        </Styled.ListItem>
      </TooltipContainer>
    );
  });
};

const areAppsEqual = (prevProps: PinnedAppsProps, nextProps: PinnedAppsProps) => {
  const prevSidebarNavigation = prevProps.sidebarNavigationInput;
  const nextSidebarNavigation = nextProps.sidebarNavigationInput;
  const {
    registeredApps: prevRegisteredApps = {},
    pinnedApps: prevPinnedApps = [],
  } = prevSidebarNavigation;
  const {
    registeredApps: nextregisteredApps = {},
    pinnedApps: nextPinnedApps = [],
  } = nextSidebarNavigation;
  const prevRegisteredAppsKeys = Object.keys(prevRegisteredApps);
  const nextregisteredAppsKeys = Object.keys(nextregisteredApps);
  if (prevPinnedApps.length !== nextPinnedApps.length) return false;
  if (prevRegisteredAppsKeys.length !== nextregisteredAppsKeys.length) return false;
  if (!prevPinnedApps.every((prevPinnedApp) => nextPinnedApps.includes(prevPinnedApp))) return false;
  return prevRegisteredAppsKeys
    .filter((prevRegisteredAppsKey) => prevPinnedApps.includes(prevRegisteredAppsKey))
    .every((prevPinnedregisteredAppKey) => {
      const prevregisteredApp = prevRegisteredApps[prevPinnedregisteredAppKey];
      const nextregisteredApp = nextregisteredApps[prevPinnedregisteredAppKey];
      return prevregisteredApp.name === nextregisteredApp.name
        && prevregisteredApp.icon === nextregisteredApp.icon;
    });
};

export default memo(PinnedApps, areAppsEqual);
