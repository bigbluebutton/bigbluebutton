import React from 'react';
import { MenuOptionItemType, MenuSeparatorItemType, MenuTextItemType } from './menuTypes';

export type BBBMenuAction =
  | (Omit<MenuOptionItemType, 'customStyles' | 'iconRight'> & {
      icon?: string;
      dividerTop?: boolean;
      iconRight?: string | null;
      customStyles?: object | false | null;
    })
  | MenuSeparatorItemType
  | MenuTextItemType;

export interface BBBMenuProps {
  trigger: React.ReactElement;
  actions: (BBBMenuAction | null | undefined)[];
  onCloseCallback?: () => void;
  dataTest?: string;
  open?: boolean;
  customStyles?: React.CSSProperties;
  opts?: Record<string, unknown>;
  accessKey?: string;
  minContent?: boolean;
}

declare const BBBMenu: React.ComponentType<BBBMenuProps>;
export default BBBMenu;
