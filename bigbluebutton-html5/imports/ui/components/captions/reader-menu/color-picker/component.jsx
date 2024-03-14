import React from "react";
import { HexColorPicker } from "react-colorful";
import Styled from './styles';

const ColorPicker = ({ color, onChange, presetColors, colorNames }) => {
  return (
    <Styled.Picker>
      <Styled.ColorPickerGlobalStyle />
      <HexColorPicker color={color} onChange={onChange} />

      <div>
        {presetColors.map((presetColor) => (
          <Styled.PickerSwatch
            key={presetColor}
            style={{ background: presetColor }}
            onClick={() => onChange(presetColor)}
            title={colorNames[presetColor]}
          />
        ))}
      </div>
    </Styled.Picker>
  );
};

export default ColorPicker;
