import React from 'react';
import AppsGallery from './component';
import { layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';

const AppsGalleryContainer: React.FC = () => {
  const {
    registeredApps,
    pinnedApps,
  } = layoutSelectInput((i: Input) => i.sidebarNavigation);

  return (
    <AppsGallery
      pinnedApps={pinnedApps}
      registeredApps={registeredApps}
    />
  );
};

export default AppsGalleryContainer;
