export type MenuOptionItemType = {
  key: string;
  dataTest?: string;
  label?: string;
  customStyles?: object;
  iconRight?: string;
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
