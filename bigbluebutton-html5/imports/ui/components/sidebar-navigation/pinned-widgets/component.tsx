import React from 'react';
import { SidebarNavigation } from '/imports/ui/components/layout/layoutTypes';

interface PinnedWidgetsProps {
  sidebarNavigationInput: SidebarNavigation;
}

const PinnedWidgets = ({ sidebarNavigationInput }: PinnedWidgetsProps) => {
  const { registeredWidgets = {}, pinnedWidgets = [] } = sidebarNavigationInput;
  return (
    <>
      {pinnedWidgets.map((pinnedWidgetsKey: string) => {
        const PinnedWidget = registeredWidgets[pinnedWidgetsKey] || null;
        if (!PinnedWidget) return null;

        if (typeof PinnedWidget === 'function') return <PinnedWidget />;
        return PinnedWidget;
      })}
    </>
  );
};

export default PinnedWidgets;
