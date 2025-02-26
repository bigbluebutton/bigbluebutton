import React from 'react';
import AppsGallery from './component';
import { layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

const AppsGalleryContainer: React.FC = () => {
  const {
    registeredApps: originalRegisteredApps,
    pinnedApps: originalPinnedApps,
  } = layoutSelectInput((i: Input) => i.sidebarNavigation);

  const { data: currentMeeting } = useMeeting((m) => ({
    isBreakout: m.isBreakout,
  }));

  const filteredApps = currentMeeting?.isBreakout
    ? Object.fromEntries(
      Object.entries(originalRegisteredApps).filter(([key]) => key !== 'breakoutroom'),
    )
    : originalRegisteredApps;

  const filteredPinnedApps = currentMeeting?.isBreakout
    ? originalPinnedApps.filter((appKey: string) => appKey !== 'breakoutroom')
    : originalPinnedApps;

  return (
    <AppsGallery
      pinnedApps={filteredPinnedApps}
      registeredApps={filteredApps}
    />
  );
};

export default AppsGalleryContainer;
