import styled from 'styled-components';
import { colorText, colorSuccess } from '/imports/ui/stylesheets/styled-components/palette';
import Icon from '/imports/ui/components/common/icon/component';
import BaseRadio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import { styled as muiStyled } from '@mui/system';

const Radio = muiStyled(BaseRadio)(() => ({
  '&.Mui-checked': {
    color: `${colorSuccess} !important`,
  },
}));

const Label = muiStyled(FormControlLabel)(() => ({
  '& .MuiFormControlLabel-label': {
    fontFamily: 'inherit !important',
    color: `${colorText} !important`,
  },
  '&.Mui-disabled': {
    cursor: 'not-allowed !important',
  },
}));

const RadioIcon = styled(Icon)``;

const RadioIconChecked = styled(RadioIcon)``;

export default {
  RadioIcon,
  RadioIconChecked,
  Radio,
  Label,
};
