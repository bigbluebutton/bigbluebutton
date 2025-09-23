import {
  InjectedAppGalleryItem,
  InjectedWidget,
  NativeWidget,
} from '/imports/ui/components/layout/layoutTypes';

export interface PinnedAppProps {
  appKey: string;
  appInfo: NativeWidget | InjectedWidget | InjectedAppGalleryItem;
  active: boolean;
  onActivate: (key: string) => void;
  children?: React.ReactNode;
}

export default PinnedAppProps;
