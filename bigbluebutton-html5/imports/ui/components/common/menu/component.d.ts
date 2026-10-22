import React from 'react';
import { MenuOptionItemType, MenuSeparatorItemType, MenuTextItemType } from './menuTypes';

export type BBBMenuAction =
  | (Omit<MenuOptionItemType, 'customStyles' | 'iconRight' | 'label'> & {
      label?: React.ReactNode;
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
  customStyles?: React.CSSProperties | null;
  opts?: Record<string, unknown>;
  accessKey?: string;
  minContent?: boolean;
  overrideMobileStyles?: boolean;
  customAnchorEl?: Element | null;
  hasRoundedCorners?: boolean;
  isHorizontal?: boolean;
  isMobile?: boolean;
  isEmoji?: boolean;
  roundButtons?: boolean;
  keepOpen?: boolean;
}

declare const BBBMenu: React.ComponentType<BBBMenuProps>;
export default BBBMenu;
