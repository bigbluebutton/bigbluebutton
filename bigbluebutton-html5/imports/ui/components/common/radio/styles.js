import styled from 'styled-components';
import { colorText, colorSuccess } from '/imports/ui/stylesheets/styled-components/palette';
import Icon from '/imports/ui/components/common/icon/component';
import BaseRadio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withStyles } from '@material-ui/core/styles';

const Radio = withStyles({
  checked: {
    color: `${colorSuccess} !important`,
  },
})(BaseRadio);

const Label = withStyles({
  label: {
    fontFamily: 'inherit !important',
    color: `${colorText} !important`,
  },
  disabled: {
    cursor: 'not-allowed !important',
  },
})(FormControlLabel);

const RadioIcon = styled(Icon)``;

const RadioIconChecked = styled(RadioIcon)``;

export default {
  RadioIcon,
  RadioIconChecked,
  Radio,
  Label,
};
