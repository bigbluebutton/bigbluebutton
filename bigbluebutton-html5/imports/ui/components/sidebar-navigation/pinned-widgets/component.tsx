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

interface PinnedWidgetsProps {
  sidebarNavigationInput: SidebarNavigation;
}

const PinnedWidgets = ({ sidebarNavigationInput }: PinnedWidgetsProps) => {
  const { registeredWidgets = {}, pinnedWidgets = [] } = sidebarNavigationInput;
  const layoutContextDispatch = layoutDispatch();
  const { sidebarContentPanel } = layoutSelectInput((i: Input) => i.sidebarContent);

  return pinnedWidgets.map((pinnedWidgetKey: string) => {
    const pinnedWidgetInfo = registeredWidgets[pinnedWidgetKey];
    const { name, icon } = pinnedWidgetInfo;
    return (
      <TooltipContainer
        title={name}
        position="right"
        key={pinnedWidgetKey}
      >
        <Styled.ListItem
          role="button"
          tabIndex={0}
          active={sidebarContentPanel === pinnedWidgetKey}
          onClick={() => {
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
              value: sidebarContentPanel !== pinnedWidgetKey,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
              value: sidebarContentPanel === pinnedWidgetKey
                ? PANELS.NONE
                : pinnedWidgetKey,
            });
          }}
        >
          <Icon iconName={icon} />
        </Styled.ListItem>
      </TooltipContainer>
    );
  });
};

const areWidgetsEqual = (prevProps: PinnedWidgetsProps, nextProps: PinnedWidgetsProps) => {
  const prevSidebarNavigation = prevProps.sidebarNavigationInput;
  const nextSidebarNavigation = nextProps.sidebarNavigationInput;
  const {
    registeredWidgets: prevRegisteredWidgets = {},
    pinnedWidgets: prevPinnedWidgets = [],
  } = prevSidebarNavigation;
  const {
    registeredWidgets: nextRegisteredWidgets = {},
    pinnedWidgets: nextPinnedWidgets = [],
  } = nextSidebarNavigation;
  const prevRegisteredWidgetsKeys = Object.keys(prevRegisteredWidgets);
  const nextRegisteredWidgetsKeys = Object.keys(nextRegisteredWidgets);
  if (prevPinnedWidgets.length !== nextPinnedWidgets.length) return false;
  if (prevRegisteredWidgetsKeys.length !== nextRegisteredWidgetsKeys.length) return false;
  if (!prevPinnedWidgets.every((prevPinnedWidget) => nextPinnedWidgets.includes(prevPinnedWidget))) return false;
  return prevRegisteredWidgetsKeys
    .filter((prevRegisteredWidgetsKey) => prevPinnedWidgets.includes(prevRegisteredWidgetsKey))
    .every((prevPinnedRegisteredWidgetKey) => {
      const prevRegisteredWidget = prevRegisteredWidgets[prevPinnedRegisteredWidgetKey];
      const nextRegisteredWidget = nextRegisteredWidgets[prevPinnedRegisteredWidgetKey];
      return prevRegisteredWidget.name === nextRegisteredWidget.name
        && prevRegisteredWidget.icon === nextRegisteredWidget.icon;
    });
};

export default memo(PinnedWidgets, areWidgetsEqual);
