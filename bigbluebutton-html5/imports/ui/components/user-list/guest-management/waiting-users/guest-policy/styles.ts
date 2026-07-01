import styled from 'styled-components';
import {
  colorPrimary,
  colorWhite,
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeBase,
  fontSizeSmall, textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { FormControlLabel, Switch } from '@mui/material';
import { styled as materialStyled } from '@mui/material/styles';

type PanelProps = {
  isChrome: boolean;
};

const Panel = styled.div<PanelProps>`
  background-color: ${colorWhite};
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
  gap: 1rem;

  ${({ isChrome }) => isChrome && `
    transform: translateZ(0);
  `}

  @media ${smallOnly} {
    transform: none !important;
  }
`;

const GuestLobbyMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  width: 100%;
  gap: 0.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
`;

const SwitchTitle = styled(FormControlLabel)`
  //height: 1.5rem;
  //width: 1.5rem;
  //flex-shrink: 0;
  .MuiFormControlLabel-label {
    color: ${colorText};
    font-size: ${fontSizeBase}
    font-weight: ${textFontWeight};
    line-height: normal;
  }
`;

const MessageSwitch = materialStyled(Switch)(({ theme }) => ({
  width: 22,
  height: 12,
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
    width: 6,
    height: 6,
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

const NoMessageText = styled.div`
  padding-left: 2.5rem;
  color: ${colorText};
  font-size: ${fontSizeSmall};
`;

const GuestLobbyMessage = styled.div`
  color: ${colorText};
  font-size: ${fontSizeSmall};
  font-style: italic;  
`;

export default {
  Panel,
  GuestLobbyMessageContainer,
  SwitchTitle,
  MessageSwitch,
  NoMessageText,
  GuestLobbyMessage,
};
