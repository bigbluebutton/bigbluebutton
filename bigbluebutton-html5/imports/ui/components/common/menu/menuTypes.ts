import { PluginIconType } from 'bigbluebutton-html-plugin-sdk';

export type MenuOptionItemType = {
  key: string;
  dataTest?: string;
  label?: string;
  customStyles?: object;
  iconRight?: PluginIconType;
  onClick?: () => void;
  disabled?: boolean;
};

export type MenuSeparatorItemType = {
  key: string;
  isSeparator?: boolean;
};

export type MenuTextItemType = {
  key: string;
  dataTest?: string;
  label?: string;
  customStyles?: object;
  iconRight?: string;
}
