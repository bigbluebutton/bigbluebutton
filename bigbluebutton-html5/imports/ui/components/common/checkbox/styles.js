import { colorText, colorSuccess } from '/imports/ui/stylesheets/styled-components/palette';
import BaseCheckbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withStyles } from '@material-ui/core/styles';

const Checkbox = withStyles({
  checked: {
    color: `${colorSuccess} !important`,
  },
})(BaseCheckbox);

const Label = withStyles({
  label: {
    fontFamily: 'inherit !important',
    color: `${colorText} !important`,
  },
  disabled: {
    cursor: 'not-allowed !important',
  },
})(FormControlLabel);

export default {
  Checkbox,
  Label,
};
