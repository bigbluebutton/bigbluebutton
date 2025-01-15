import styled from 'styled-components';
import SelectMui from '@mui/material/Select';
import FormControlMui from '@mui/material/FormControl';
import InputLabelMui from '@mui/material/InputLabel';
import { colorWhite, colorGrayDark } from '/imports/ui/stylesheets/styled-components/palette';

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
  color: ${colorGrayDark} !important;
`;

const InputLabel = styled(InputLabelMui)`
  background-color: ${colorWhite};
  color: ${colorGrayDark} !important;
  border-radius: 0.5rem;
  padding: 0 0.2rem !important;
`;

const Select = styled(SelectMui)`
  background-color: ${colorWhite};
  flex: 1;
  border-radius: 0.5rem !important;
  overflow: hidden;
`;

export default {
  Container,
  SelectGroupContainer,
  FormControl,
  InputLabel,
  Select,
};
