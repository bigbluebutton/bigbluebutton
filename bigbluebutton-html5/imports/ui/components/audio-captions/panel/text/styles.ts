import styled from 'styled-components';
import { FormControlLabel, Switch } from '@mui/material';
import { styled as materialStyled } from '@mui/material/styles';
import { colorGrayDark, colorLink, colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeBase, fontSizeSmall, textFontWeight } from '/imports/ui/stylesheets/styled-components/typography';

const CaptionsToggleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
`;

const SwitchTitle = styled(FormControlLabel)`
  flex-shrink: 0;
  .MuiFormControlLabel-label {
    color: ${colorGrayDark};
    font-size: ${fontSizeBase}
    font-weight: ${textFontWeight};
  }
`;

const MaterialSwitch = materialStyled(Switch)(({ theme }) => ({
  width: 24,
  height: 14,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      // width: 10,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: colorPrimary,
        ...theme.applyStyles('dark', {
          backgroundColor: colorPrimary,
        }),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 7,
    height: 7,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
    transform: 'translateY(1px)',
  },
  '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: 'rgba(0,0,0,.25)',
    boxSizing: 'border-box',
    ...theme.applyStyles('dark', {
      backgroundColor: 'rgba(255,255,255,.35)',
    }),
  },
}));

const CaptionsTerms = styled.div`
  padding-left: 2.7rem;
  color: ${colorGrayDark};
  font-size: ${fontSizeSmall};
  font-weight: ${textFontWeight};
`;

const CaptionsTermsLink = styled.a`
  color: ${colorLink};
`;

export default {
  CaptionsToggleContainer,
  SwitchTitle,
  MaterialSwitch,
  CaptionsTerms,
  CaptionsTermsLink,
};
