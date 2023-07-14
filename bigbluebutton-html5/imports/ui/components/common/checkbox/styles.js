import { colorText, colorSuccess } from '/imports/ui/stylesheets/styled-components/palette';
import BaseCheckbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { styled } from '@mui/system';

const Checkbox = styled(BaseCheckbox)(() => ({
  '&.Mui-checked': {
    color: `${colorSuccess} !important`,
  },
}));

const Label = styled(FormControlLabel)(() => ({
  '& .MuiFormControlLabel-label': {
    fontFamily: 'inherit !important',
    color: `${colorText} !important`,
  },
  '&.Mui-disabled': {
    cursor: 'not-allowed !important',
  },
}));

export default {
  Checkbox,
  Label,
};
