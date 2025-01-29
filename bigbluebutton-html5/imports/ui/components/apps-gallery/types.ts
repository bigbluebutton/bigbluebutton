import { registeredApps } from '/imports/ui/components/layout/layoutTypes';

export interface AppsGalleryProps {
  registeredApps: registeredApps;
  pinnedApps: string[];
}
