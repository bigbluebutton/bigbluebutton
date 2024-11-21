import { RegisteredWidgets } from '/imports/ui/components/layout/layoutTypes';

export interface WidgetsGalleryProps {
  registeredWidgets: RegisteredWidgets;
  pinnedWidgets: string[];
}
