import styled from 'styled-components';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { styled as materialStyled } from '@mui/material/styles';
import {
  borderSize,
  borderSizeLarge,
  toastContentWidth,
  lgBorderRadius,
  smPadding,
  contentSidebarPadding,
} from '../../../stylesheets/styled-components/general';
import {
  colorGrayDark,
  colorBorder,
  colorWhite,
  colorPrimary,
} from '../../../stylesheets/styled-components/palette';
import { TextElipsis } from '../../../stylesheets/styled-components/placeholders';
import Button from '/imports/ui/components/common/button/component';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import {
  HeaderContainer as BaseHeaderContainer,
  Separator as BaseSeparator,
  PanelContent as BasePanelContent,
} from '/imports/ui/components/sidebar-content/styles';
import { fontSizeBase, textFontWeight } from '../../../stylesheets/styled-components/typography';

const HeaderContainer = styled(BaseHeaderContainer)``;

const Separator = styled(BaseSeparator)``;

const TimerSidebarContent = styled(BasePanelContent)``;

const TimerTitle = styled.div`
  ${TextElipsis};
  flex: 1;

  & > button, button:hover {
    max-width: ${toastContentWidth};
  }
`;
// @ts-ignore - JS code
const TimerMinimizeButton = styled(Button)`
  position: relative;
  background-color: ${colorWhite};
  display: block;
  margin: ${borderSizeLarge};
  margin-bottom: ${borderSize};
  padding-left: 0;
  padding-right: inherit;

  [dir="rtl"] & {
    padding-left: inherit;
    padding-right: 0;
  }

  > i {
    color: ${colorGrayDark};
    font-size: smaller;

    [dir="rtl"] & {
      -webkit-transform: scale(-1, 1);
      -moz-transform: scale(-1, 1);
      -ms-transform: scale(-1, 1);
      -o-transform: scale(-1, 1);
      transform: scale(-1, 1);
    }
  }

  &:hover {
    background-color: ${colorWhite};
  }
`;

const TimerContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-grow: 1;
  min-height: 100%;
`;

const TimerCurrent = styled.span`
  border-bottom: 1px solid ${colorBorder};
  display: flex;
  font-size: 2.5rem;
  justify-content: center;
  padding: 0.5rem 0 1.45rem 0;
`;

const TimerType = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  padding-bottom: 2rem;
`;
// @ts-ignore - JS code
const TimerSwitchButton = styled(Button)`
  width: 100%;
  height: 3rem;
  border-radius: ${lgBorderRadius};
  margin: 0 .5rem;
`;

const TimeInputWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0;
  width: 100%;
  border-bottom: 1px solid ${colorBorder};
  padding: 0.5rem 0 1.3rem 0;
`;

const TimeInputGroup = styled.div`
  display: flex;
  align-items: center;
  font-size: 2.5rem;
  color: ${colorGrayDark};
  justify-content: center;
`;

// @ts-ignore - JS code
const IncrementDecrementButton = styled(Button)`
  border-radius: ${lgBorderRadius};
  width: 2.6rem;
  height: 1.2rem;
  min-width: 0;
  padding: 0;
  font-size: 1rem;
  line-height: 0.9;
`;

const TimeInputColon = styled.span`
  align-self: center;
  padding: 0 0.1rem;
`;

const TimerSongsWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  flex-flow: column;
  margin-top: 2rem;
  width: 100%;
`;

const TimerRow = `
  display: flex;
  flex-flow: row;
  flex-grow: 1;
`;

const TimerTracks = styled.div`
  display: flex;
  flex-flow: column;
  flex-grow: 1;
  flex-basis: 0;
  display: flex;
  margin-top: 0.8rem;
  padding-left: 0;

  label {
    display: flex;
    align-items: center;
  }

  input {
    margin: auto 0.5rem;
  }
`;

const TimerTrackItem = styled.div`
  ${TimerRow}
`;

const TimerInput = styled.input<{isSelected: boolean}>`
  background: none;
  border: none;
  border-bottom: 2px solid #e9e9ed;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  font-weight: ${textFontWeight};
  font-variant-numeric: tabular-nums;
  text-align: center;
  width: 2ch;
  padding: 0;
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    outline: none;
    border-bottom: 2px solid ${colorPrimary};
  }
  ${({ isSelected }) => (isSelected && `
    outline: none;
    border-bottom: 2px solid ${colorPrimary};   
  `)};

  &:disabled,
  &[disabled] {
    cursor: not-allowed;
    opacity: .75;
    background-color: transparent;
  }
`;

const TimerScrollableContent = styled(ScrollboxVertical)`
  flex-grow: 1;
  overflow-y: auto;
  margin: 0 ${smPadding} 0;
  padding: ${contentSidebarPadding} ${contentSidebarPadding} ${contentSidebarPadding};
  height: 100%;
`;

const MusicSwitchLabel = styled(FormControlLabel)`
  margin-left: 0 !important;

  .MuiFormControlLabel-label {
    color: ${colorGrayDark};
    font-size: ${fontSizeBase};
    font-weight: ${textFontWeight};
  }
`;

const MaterialSwitch = materialStyled(Switch)(({ theme }) => ({
  width: 24,
  height: 14,
  padding: 0,
  display: 'flex',
  marginRight: '0.5rem',
  '&:active': {
    '& .MuiSwitch-thumb': {
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
  },
}));

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-top: 1rem;
`;

const ButtonRow = styled.div`
  display: flex;
  width: 100%;
  gap: 1rem;
`;

// @ts-ignore - JS code
const ControlButton = styled(Button)`
  flex-grow: 1;
  border-radius: ${lgBorderRadius};
  height: 3rem;
  width: 100%;
`;

const ResetButton = styled(ControlButton)`
  border: ${borderSize} solid ${colorPrimary};
`;

const DeactivateButton = styled(ControlButton)`
  background: transparent;
  color: ${colorGrayDark};

  &:hover, &:focus {
    background: transparent;
    border-color: transparent !important;
  }
`;

const FooterSeparator = styled(BaseSeparator)`
  margin-top: auto;
`;

export default {
  HeaderContainer,
  Separator,
  TimerSidebarContent,
  TimerTitle,
  TimerMinimizeButton,
  TimerContent,
  TimerCurrent,
  TimerType,
  TimerSwitchButton,
  TimeInputWrapper,
  TimeInputGroup,
  IncrementDecrementButton,
  TimeInputColon,
  TimerSongsWrapper,
  TimerTracks,
  TimerTrackItem,
  TimerInput,
  TimerScrollableContent,
  MusicSwitchLabel,
  MaterialSwitch,
  ControlsContainer,
  ButtonRow,
  ControlButton,
  ResetButton,
  DeactivateButton,
  FooterSeparator,
};
