import styled, { createGlobalStyle } from 'styled-components';

const ColorPickerGlobalStyle = createGlobalStyle`
  .react-colorful {
    display: none !important;
  }
`;

const Picker = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.2);
  width: 140px;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 12px;
  border-radius: 4px;
  padding: 5px;
  display: flex;
  flex-wrap: wrap;
  background: #fff;
  position: relative;
`;

const PickerSwatch = styled.button`
  width: 25px;
  height: 25px;
  border: none;

  &:hover {
    cursor: pointer;
    border: 1px solid #fff;
    border-style: inset;
  }
`;

export default {
    ColorPickerGlobalStyle,
    Picker,
    PickerSwatch,
  };
  