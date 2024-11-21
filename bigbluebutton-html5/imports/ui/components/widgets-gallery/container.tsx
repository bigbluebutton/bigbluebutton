import React from 'react';
import WidgetsGallery from './component';
import { layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';

const WidgetsGalleryContainer: React.FC = () => {
  const {
    registeredWidgets,
    pinnedWidgets,
  } = layoutSelectInput((i: Input) => i.sidebarNavigation);

  return (
    <WidgetsGallery
      pinnedWidgets={pinnedWidgets}
      registeredWidgets={registeredWidgets}
    />
  );
};

export default WidgetsGalleryContainer;
