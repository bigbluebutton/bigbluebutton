import { SelectChangeEvent } from '@mui/material';

export interface Option {
  label: string;
  value: string | number;
}

export interface SelectorProps {
  title?: string;
  icon?: string;
  options: Option[];
  defaultOption?: Option;
  onChange: (value: string | number, event: SelectChangeEvent<unknown>) => void;
  width?: number;
  dataTest?: string;
}
