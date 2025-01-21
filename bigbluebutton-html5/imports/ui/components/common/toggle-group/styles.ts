import styled from 'styled-components';
import { ToggleButton as MuiToggleButton, ToggleButtonProps } from '@mui/material';
import FormControlMui from '@mui/material/FormControl';
import { colorPrimary, colorWhite, colorGrayLight } from '/imports/ui/stylesheets/styled-components/palette';

interface ToggleButton {
  hasTitle?: boolean;
}

const ToggleButton = styled(MuiToggleButton)<ToggleButtonProps & ToggleButton>`
  border-radius: .5rem !important;
  ${({ hasTitle }) => hasTitle && 'padding: 0.2rem 0.5rem !important'};

  ${({ selected }) => selected && `
    background-color: ${colorPrimary} !important;
    color: ${colorWhite} !important;
  `};

  ${({ selected }) => !selected && `
    background-color: ${colorWhite} !important;
    color: ${colorGrayLight} !important;
  `};

  .MuiToggleButtonGroup-lastButton {
    margin-left: 0;
  }
`;

const ToggleGroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  .MuiToggleButtonGroup-root {
    background-color: ${colorWhite};
    border-radius: 2rem;
  }
`;

const Title = styled.label`
  color: ${colorWhite};
  font-size: 0.8rem;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FormControl = styled(FormControlMui)`
  outline: transparent;
`;

export default {
  ToggleButton,
  ToggleGroupContainer,
  Title,
  Container,
  FormControl,
};
