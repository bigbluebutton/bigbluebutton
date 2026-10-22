import { PluginIconType } from 'bigbluebutton-html-plugin-sdk';
import {
  MenuOptionItemType,
  MenuSeparatorItemType,
  MenuTextItemType,
} from '/imports/ui/components/common/menu/menuTypes';

export type BarItemPriority = number;

export type BarKey = 'navBar' | 'actionsBar';

// A 'hide' item collapses with no menu entry, for controls the bar already offers elsewhere.
export type BarItemKind = 'menu' | 'expand' | 'hide';

export type OverflowMenuOptionEntry = MenuOptionItemType & {
  icon?: PluginIconType | string;
  // Never promoted to a direct button when it is the only entry (e.g. leaving the meeting).
  keepInMenu?: boolean;
};

export type OverflowMenuEntry = OverflowMenuOptionEntry
  | MenuSeparatorItemType
  | MenuTextItemType;

export interface BarItemDescriptor {
  id: string;
  priority: BarItemPriority;
  order: number;
  kind?: BarItemKind;
}

export interface ComputeOverflowParams {
  items: BarItemDescriptor[];
  canOverflow: (id: string) => boolean;
  availableWidth: number;
  // Width the bar needs with these items collapsed, with or without the overflow button.
  requiredWidth: (hidden: ReadonlySet<string>, withOverflowButton: boolean) => number;
  previousOverflow: readonly string[];
  // Only for a bar whose overflow button exists just to hold the collapsed items.
  menuEntryCount?: (id: string) => number;
}

export interface PluginBarItem {
  id: string;
  dataTest?: string;
}

export interface PluginBarButton extends PluginBarItem {
  label?: string;
  tooltip?: string;
  icon?: PluginIconType;
  onClick?: () => void;
  disabled?: boolean;
}

export type UnorderedBarItemDescriptor = Omit<BarItemDescriptor, 'order'>;

export type LooseEntry = {
  key: string;
  label?: string;
  icon?: unknown;
  iconRight?: unknown;
  customStyles?: object;
  disabled?: boolean;
  dataTest?: string;
  isSeparator?: boolean;
  onClick?: () => void;
};
