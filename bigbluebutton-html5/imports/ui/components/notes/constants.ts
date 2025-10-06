import { PANELS } from '/imports/ui/components/layout/enums';

export const NotesRenderMode = {
  SIDEBAR: 'sidebar',
  PINNED: 'pinned',
} as const;

export const sidebarContentToIgnoreDelay = [PANELS.CAPTIONS];

export default NotesRenderMode;
