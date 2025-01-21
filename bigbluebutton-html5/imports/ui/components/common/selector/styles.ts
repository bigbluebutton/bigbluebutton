import styled from 'styled-components';
import { Select as SelectMui, SelectProps } from '@mui/material';
import FormControlMui from '@mui/material/FormControl';
import { colorWhite, colorGrayDark } from '/imports/ui/stylesheets/styled-components/palette';

interface StyledSelectProps {
  hasTitle?: boolean;
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SelectGroupContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormControl = styled(FormControlMui)`
  height: 100%;
  color: ${colorGrayDark} !important;
`;

const Select = styled(SelectMui)<StyledSelectProps & SelectProps>`
  background-color: ${colorWhite};
  flex: 1;
  border-radius: 0.5rem !important;
  overflow: hidden;

  ${({ hasTitle }) => hasTitle && `
    & .MuiSelect-select {
      padding: 0.25rem 0.5rem;
    }
  `}
`;

const Title = styled.label`
  color: ${colorWhite};
  font-size: 0.8rem;
`;

export default {
  Container,
  SelectGroupContainer,
  FormControl,
  Select,
  Title,
};
