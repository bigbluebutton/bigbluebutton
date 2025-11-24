import { MouseEvent } from 'react';

export interface Option {
  label: string;
  value: string | number;
}

export interface ToggleGroupProps {
  title?: string;
  options: Option[];
  defaultOption: Option;
  exclusive?: boolean;
  dataTest?: string;
  onChange: (selectedValues: string | number | string[] | number[], event: MouseEvent<HTMLElement>) => void
}
