import styled from 'styled-components';
import {
  colorPrimary,
  colorWhite,
  colorGrayLighter,
  colorGrayLightest,
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  xsPadding,
  smPaddingY,
  borderRadius,
  smPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeBase,
  fontSizeSmall, textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { FormControlLabel, Switch } from '@mui/material';
import { styled as materialStyled } from '@mui/material/styles';
import TextareaAutosize from 'react-autosize-textarea';
import Button from '@mui/material/Button';

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
  padding-top: 1rem;
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

const SendButton = styled(Button)`
  align-self: center;
  font-size: 0.9rem;
  height: 100%;
  background-color: ${colorPrimary} !important;

  & > span {
    height: 100%;
    display: flex;
    align-items: center;
    border-radius: 0 0.75rem 0.75rem 0;
  }

  [dir="rtl"]  & {
    -webkit-transform: scale(-1, 1);
    -moz-transform: scale(-1, 1);
    -ms-transform: scale(-1, 1);
    -o-transform: scale(-1, 1);
    transform: scale(-1, 1);
  }
`;

const Input = styled(TextareaAutosize)`
  flex: 1;
  background: #fff;
  background-clip: padding-box;
  margin: ${xsPadding} 0 ${xsPadding} ${xsPadding};
  color: ${colorGrayLighter};
  -webkit-appearance: none;
  padding: calc(${smPaddingY} * 2.5) 0 calc(${smPaddingX} * 1.25) calc(${smPaddingY} * 2.5);
  resize: none;
  transition: color 0.3s ease;
  border-radius: ${borderRadius};
  font-size: ${fontSizeBase};
  line-height: 1;
  min-height: 2.5rem;
  max-height: 3.5rem;
  overflow-y: auto;
  box-shadow: none;
  outline: none;

  border: 1px solid ${colorGrayLightest};

  [dir='ltr'] & {
    border-radius: 0.75rem 0 0 0.75rem;
  }

  [dir='rtl'] & {
    border-radius: 0 0.75rem 0.75rem 0;
  }

  &:focus {
    color: ${colorText};
  }

  &:disabled,
  &[disabled] {
    cursor: not-allowed;
    opacity: .75;
    background-color: rgba(167,179,189,0.25);
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  min-width: 0;
  width: 100%;
  z-index: 0;
  border-radius: 0.75rem;
  height: 3.5rem;
`;

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
  SendButton,
  Input,
  InputWrapper,
  NoMessageText,
  GuestLobbyMessage,
};
