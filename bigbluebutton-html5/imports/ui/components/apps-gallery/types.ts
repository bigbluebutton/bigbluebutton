import { registeredApps } from '/imports/ui/components/layout/layoutTypes';

export const APPS_GALLERY_VIEW_MODE = {
  LIST: 'list',
  GRID: 'grid',
} as const;

export type AppsGalleryViewModeType = typeof APPS_GALLERY_VIEW_MODE[keyof typeof APPS_GALLERY_VIEW_MODE];

export interface AppsGalleryProps {
  registeredApps: registeredApps;
  pinnedApps: string[];
}
