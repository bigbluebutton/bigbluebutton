import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import { SelectChangeEvent } from '@mui/material/Select';
import { SelectorProps } from './types';
import Styled from './styles';

// Mirrors the event MUI's Select hands to onChange: an Event whose target is
// replaced by { value, name }, so plugins can rely on event.target.value.
const buildFallbackEvent = (value: string | number): SelectChangeEvent<unknown> => {
  const event = new Event('change');
  Object.defineProperty(event, 'target', {
    writable: true,
    value: { value, name: undefined },
  });
  return event as SelectChangeEvent<unknown>;
};

export default function Selector({
  title = '',
  options = [],
  defaultOption = options[0],
  onChange,
  width = 140,
  dataTest = '',
}: SelectorProps): React.ReactNode {
  const [selected, setSelected] = React.useState<string | number>(defaultOption.value);

  const changeSelectedValue = (newValue: string | number, event: SelectChangeEvent<unknown>) => {
    setSelected(newValue);
    onChange?.(newValue, event);
  };

  // If the currently-selected value is no longer among the options (e.g. a
  // plugin removed the option that was selected), fall back to the default
  // rather than rendering an empty value.
  const isSelectedValid = options.some((option) => option.value === selected);
  const displayedValue = isSelectedValid ? selected : defaultOption.value;

  React.useEffect(() => {
    // Notify only on an actual change: avoids loops when onChange recreates options
    if (!isSelectedValid && selected !== defaultOption.value) {
      changeSelectedValue(defaultOption.value, buildFallbackEvent(defaultOption.value));
    }
  }, [isSelectedValid, selected, defaultOption.value]);

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    changeSelectedValue(event.target.value as string | number, event);
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
        {title && <Styled.Title>{title}</Styled.Title>}
        <Styled.Select
          value={displayedValue}
          onChange={handleChange}
          displayEmpty
          hasTitle={!!title}
          data-test={dataTest}
        >
          {children}
        </Styled.Select>
      </Styled.FormControl>
    </Styled.Container>
  );
}
