import React, { useState, MouseEvent } from 'react';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { ToggleGroupProps, Option } from './types';
import Styled from './styles';

export default function ToggleGroup({
  title = '',
  options = [],
  defaultOption = options[0],
  onChange,
  exclusive = true,
  dataTest = '',
}: ToggleGroupProps) {
  const [selectedValues, setSelectedValues] = useState([defaultOption.value]);

  const isSelected = (option: Option) => (
    selectedValues.some((selectedItem) => option.value === selectedItem)
  );

  const handleChange = (
    event: MouseEvent<HTMLElement>,
    value: string | number | string[] | number[],
  ) => {
    // toggle button group returns an array of values when it is not exclusive
    // Here the value is always transformed into an array.
    const transformedValue = Array.isArray(value) ? value : [value];
    const isEqual = (Array.isArray(value)
      && selectedValues.length === value.length
      && selectedValues.every((selectedValue, index) => selectedValue === selectedValues[index]))
      || (selectedValues.length === 1 && value === selectedValues[0]);
    if (isEqual) return;
    setSelectedValues(transformedValue);
    if (!onChange) return;
    onChange(value, event);
  };

  const children = options.map((option: Option) => {
    const {
      label,
      value,
    } = option;
    return (
      <Styled.ToggleButton
        selected={isSelected(option)}
        value={value}
        key={value}
        hasTitle={!!title}
      >
        {label}
      </Styled.ToggleButton>
    );
  });

  return (
    <Styled.Container>
      <Styled.ToggleGroupContainer>
        {title && <Styled.Title>{title}</Styled.Title>}
        <Styled.FormControl sx={{}} size="small">
          <ToggleButtonGroup
            size={title ? 'small' : 'medium'}
            color="primary"
            value={selectedValues}
            onChange={handleChange}
            exclusive={exclusive}
            data-test={dataTest}
          >
            {children}
          </ToggleButtonGroup>
        </Styled.FormControl>
      </Styled.ToggleGroupContainer>
    </Styled.Container>
  );
}
