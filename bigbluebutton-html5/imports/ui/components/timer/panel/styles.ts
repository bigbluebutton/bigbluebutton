import styled, { css } from 'styled-components';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { styled as materialStyled } from '@mui/material/styles';
import {
  borderSize,
  borderSizeLarge,
  toastContentWidth,
  lgBorderRadius,
  borderRadiusRounded,
  smPadding,
  contentSidebarPadding,
} from '../../../stylesheets/styled-components/general';
import {
  colorGrayDark,
  colorBorder,
  colorWhite,
  colorPrimary,
  colorBlueLighter,
  colorText,
  colorGray,
} from '../../../stylesheets/styled-components/palette';
import { TextElipsis } from '../../../stylesheets/styled-components/placeholders';
import Button from '/imports/ui/components/common/button/component';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import {
  Separator as BaseSeparator,
  PanelContent as BasePanelContent,
} from '/imports/ui/components/sidebar-content/styles';
import { fontSizeBase, textFontWeight } from '../../../stylesheets/styled-components/typography';

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

const TimeInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0;
  width: 100%;
  border-bottom: 1px solid ${colorBorder};
  padding: 0.5rem 0 1.3rem 0;
`;

const TimeInputGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
  width: 100%;
  max-width: 17rem;
`;

// @ts-ignore - JS code
const IncrementDecrementButton = styled(Button)`
  border-radius: ${lgBorderRadius};
  width: 2.6rem;
  height: 1.2rem;
  min-width: 0;
  padding: 0;
  font-size: ${fontSizeBase};
  line-height: 0.9;
`;

const TimerSongsWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  flex-flow: column;
  margin-top: 2rem;
  width: 100%;
  padding: 0.75rem;
  border: 1px solid color-mix(in srgb, ${colorBlueLighter} 50%, transparent);
  border-radius: 0.5rem;
`;

const TimerRow = `
  display: flex;
  flex-flow: row;
  flex-grow: 1;
`;

const TimerTracks = styled.div`
  display: flex;
  flex-flow: column;
  width: 100%;
  margin-top: 0.8rem;
  padding-left: 0;

  label {
    display: flex;
    align-items: center;
  }

  input[type="radio"] {
    margin: auto 0.5rem;
    accent-color: ${colorPrimary};
  }
`;

const TimerTrackItem = styled.div<{isSelected?: boolean}>`
  ${TimerRow}
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 0.125rem solid ${({ isSelected }) => (
    isSelected
      ? colorPrimary
      : `color-mix(in srgb, ${colorBlueLighter} 40%, transparent)`
  )};
  background-color: ${({ isSelected }) => (
    isSelected
      ? `color-mix(in srgb, ${colorBlueLighter} 15%, transparent)`
      : 'transparent'
  )};
  margin-bottom: 0.5rem;
  transition: all 120ms ease;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    width: 100%;
    cursor: pointer;
  }
`;

const TimerInput = styled.input<{isSelected: boolean}>`
  box-sizing: border-box;
  background-color: ${colorWhite};
  border: 1px solid ${colorBorder};
  color: ${colorText};
  font-family: inherit;
  font-size: 1.5rem;
  line-height: 1.2;
  border-radius: ${lgBorderRadius};
  font-variant-numeric: tabular-nums;
  text-align: center;
  width: 100%;
  min-width: 0;
  height: 3rem;
  padding-block: 0.4rem;
  padding-inline: 0.5rem 1.5rem;
  cursor: text;
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    outline: none;
    border-color: ${colorPrimary};
    box-shadow: 0 0 0 1px ${colorPrimary};
  }

  ${({ isSelected }) => isSelected && css`
    border-color: ${colorPrimary};
    box-shadow: 0 0 0 1px ${colorPrimary};
  `}

  &:disabled {
    cursor: not-allowed;
    opacity: .75;
    background-color: color-mix(in srgb, ${colorBlueLighter} 20%, transparent);
  }
`;

const TimeUnitContainer = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

const TimeUnitLabel = styled.label`
  font-size: ${fontSizeBase};
  color: ${colorGray};
  text-transform: capitalize;
`;

const InputArrows = styled.div<{disabled?: boolean}>`
  position: absolute;
  top: 1px;
  inset-inline-end: 1px;
  padding: 0.25rem 0.15rem;
  height: calc(3rem - 2px);
  width: 1.3rem;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  opacity: ${({ disabled }) => (disabled ? 0.4 : 0.8)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
`;

// @ts-ignore - JS code
const InputArrowButton = styled(Button)<{isSelected?: boolean}>`
  flex: 1;
  min-width: auto;
  padding: 0;
  background: transparent !important;
  border: none;
  box-shadow: none !important;
  
  &:hover {
    background: transparent !important;
  }
  
  i {
    display: none;
  }
  
  &::before {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-left: 0.25rem solid transparent;
    border-right: 0.25rem solid transparent;
    border-bottom: 0.28rem solid ${colorGrayDark};
    margin: auto;
    transition: border-bottom-color 120ms ease;
  }
  
  &:hover::before {
    border-bottom-color: ${colorPrimary};
    opacity: 1;
  }
`;

// @ts-ignore - JS code
const InputArrowButtonDown = styled(Button)<{isSelected?: boolean}>`
  flex: 1;
  min-width: auto;
  padding: 0;
  background: transparent !important;
  border: none;
  box-shadow: none !important;
  
  &:hover {
    background: transparent !important;
  }
  
  i {
    display: none;
  }
  
  &::before {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-left: 0.25rem solid transparent;
    border-right: 0.25rem solid transparent;
    border-top: 0.28rem solid ${colorGrayDark};
    margin: auto;
    transition: border-top-color 120ms ease;
  }
  
  &:hover::before {
    border-top-color: ${colorPrimary};
    opacity: 1;
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

const TimerPresets = styled.div`
  padding: 0.75rem 0 0.25rem;
`;

const TimerPresetsLabel = styled.div`
  color: ${colorText};
  font-size: ${fontSizeBase};
  font-weight: 600;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const TimerPresetsRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.35rem;
`;

const TimerPresetOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
  min-width: 0;
`;

const TimerAdjustmentButton = styled.button`
  cursor: pointer;
  font-family: inherit;
  font-size: ${fontSizeBase};
  line-height: 1.5;
  color: ${colorPrimary};
  background-color: color-mix(in srgb, ${colorBlueLighter} 20%, ${colorWhite});
  border: 1px solid transparent;
  border-radius: ${borderRadiusRounded};
  padding: 0.25rem 0.4rem;
  white-space: nowrap;
  text-align: center;

  &:hover:not(:disabled) {
    background-color: color-mix(in srgb, ${colorBlueLighter} 40%, ${colorWhite});
  }

  &:focus-visible {
    outline: 2px solid ${colorPrimary};
    outline-offset: 2px;
  }

  &:active:not(:disabled) {
    background-color: color-mix(in srgb, ${colorBlueLighter} 60%, ${colorWhite});
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

// @ts-ignore - JS code
const PresetArrowButton = styled(Button)`
  padding: 0.25rem 0.35rem;
  min-width: auto;
  
  i {
    margin: 0;
    font-size: ${fontSizeBase};
  }

  [dir="rtl"] & i {
    -webkit-transform: scale(-1, 1);
    -moz-transform: scale(-1, 1);
    -ms-transform: scale(-1, 1);
    -o-transform: scale(-1, 1);
    transform: scale(-1, 1);
  }
`;

const TimerAddsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0 0.25rem;
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  padding-top: 1rem;
  gap: 0.75rem;
`;

const ButtonRow = styled.div`
  display: flex;
  width: 100%;
  gap: 1rem;
`;

// The row's buttons share its width equally.
const ActionButton = styled(BBButton)`
  flex: 1;
`;

const FooterSeparator = styled(BaseSeparator)`
  margin-top: auto;
`;

export default {
  Separator,
  TimerSidebarContent,
  TimerTitle,
  TimerMinimizeButton,
  TimerContent,
  TimerCurrent,
  TimerType,
  TimeInputWrapper,
  TimeInputGroup,
  IncrementDecrementButton,
  TimerSongsWrapper,
  TimerTracks,
  TimerTrackItem,
  TimerInput,
  TimeUnitContainer,
  TimeUnitLabel,
  InputArrows,
  InputArrowButton,
  InputArrowButtonDown,
  TimerScrollableContent,
  MusicSwitchLabel,
  MaterialSwitch,
  ControlsContainer,
  ButtonRow,
  ActionButton,
  FooterSeparator,
  TimerPresetsRow,
  TimerPresets,
  TimerPresetsLabel,
  TimerPresetOptions,
  TimerAdjustmentButton,
  PresetArrowButton,
  TimerAddsRow,
};
