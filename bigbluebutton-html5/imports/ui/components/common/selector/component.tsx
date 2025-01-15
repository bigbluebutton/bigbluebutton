import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import { SelectChangeEvent } from '@mui/material/Select';
import { SelectorProps } from './types';
import Styled from './styles';

export default function Selector({
  title = '',
  options = [],
  defaultOption = options[0],
  onChange,
  width = 140,
}: SelectorProps): React.ReactNode {
  const [selected, setSelected] = React.useState<string | number>(defaultOption.value);

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    const value = event.target.value as string | number;
    setSelected(value);
    if (!onChange) return;
    onChange(value, event);
  };

  const children = options.map((option) => {
    const {
      label,
      value,
    } = option;

    return (
      <MenuItem
        key={value}
        value={value}
      >
        {label}
      </MenuItem>
    );
  });

  return (
    <Styled.Container>
      <Styled.FormControl sx={{ width }} size="small">
        {title && <Styled.InputLabel id="selector-input-label">{title}</Styled.InputLabel>}
        <Styled.Select
          value={selected}
          onChange={handleChange}
          autoWidth
          displayEmpty
          label={title}
          labelId="selector-input-label"
        >
          {children}
        </Styled.Select>
      </Styled.FormControl>
    </Styled.Container>
  );
}
