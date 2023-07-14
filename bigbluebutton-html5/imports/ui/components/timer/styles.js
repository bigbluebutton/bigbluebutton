import styled from 'styled-components';
import {
  borderSize,
  borderSizeLarge,
  mdPaddingX,
  mdPaddingY,
  pollHeaderOffset,
  toastContentWidth,
  borderRadius,
} from '../../stylesheets/styled-components/general';
import {
  colorGrayDark,
  colorGrayLighter,
  colorGrayLightest,
  colorGray,
  colorBlueLight,
  colorWhite,
  colorPrimary,
} from '../../stylesheets/styled-components/palette';
import { TextElipsis } from '../../stylesheets/styled-components/placeholders';
import Button from '/imports/ui/components/common/button/component';

const TimerSidebarContent = styled.div`
  background-color: ${colorWhite};
  padding:
    ${mdPaddingX}
    ${mdPaddingY}
    ${mdPaddingX}
    ${mdPaddingX};

  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: space-around;
  overflow: hidden;
  height: 100%;
  transform: translateZ(0);
`;

const TimerHeader = styled.header`
  position: relative;
  top: ${pollHeaderOffset};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const TimerTitle = styled.div`
  ${TextElipsis};
  flex: 1;

  & > button, button:hover {
    max-width: ${toastContentWidth};
  }
`;

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
  height: 100%;
  overflow: auto;
`;

const TimerCurrent = styled.span`
  border-bottom: 1px solid ${colorGrayLightest};
  border-top: 1px solid ${colorGrayLightest};
  display: flex;
  font-size: xxx-large;
  justify-content: center;
`;

const TimerType = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  padding-top: 2rem;
`;

const TimerSwitchButton = styled(Button)`
  width: 100%;
  height: 2rem;
  margin: 0 .5rem;
`;

const StopwatchTime = styled.div`
  display: flex;
  margin-top: 4rem;
  width: 100%;
  height: 3rem;
  font-size: x-large;
  justify-content: center;

  input {
    width: 5rem;
  }
`;

const StopwatchTimeInput = styled.div`
  display: flex;
  flex-direction: column;

  .label {
    display: flex;
    font-size: small;
    justify-content: center;
  }
`;

const StopwatchTimeInputLabel = styled.div`
  display: flex;
  font-size: small;
  justify-content: center;
`;

const StopwatchTimeColon = styled.span`
  align-self: center;
  padding: 0 .25rem;
`;

const TimerSongsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;
  margin-top: 4rem;
  margin-bottom: -2rem;
`;

const TimerRow = `
  display: flex;
  flex-flow: row;
  flex-grow: 1;
`;

const TimerCol = `
  display: flex;
  flex-flow: column;
  flex-grow: 1;
  flex-basis: 0;
`;
const TimerSongsTitle = styled.div`
  ${TimerRow}
  display: flex;
  font-weight: bold;
  font-size: 1.1rem;
  opacity: ${({ stopwatch }) => (stopwatch ? '50%' : '100%')}
`;

const TimerTracks = styled.div`
  ${TimerCol}
  display: flex;
  margin-top: 0.8rem;
  margin-bottom: 2rem;
  
  .row {
    margin: 0.5rem auto;
  }

  label {
    display: flex;
  }
  
  input {
    margin: auto 0.5rem;
  }
`;

const TimerTrackItem = styled.div`
  ${TimerRow}
`;

const TimerControls = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  margin-top: 4rem;
`;

const TimerControlButton = styled(Button)`
  width: 6rem;
  margin: 0 1rem;
`;

const TimerInput = styled.input`
  flex: 1;
  border: 1px solid ${colorGrayLighter};
  width: 50%;
  text-align: center;
  padding: .25rem;
  border-radius: ${borderRadius};
  background-clip: padding-box;
  outline: none;

  &::placeholder {
    color: ${colorGray};
    opacity: 1;
  }

  &:focus {
    border-radius: ${borderSize};
    box-shadow: 0 0 0 ${borderSize} ${colorBlueLight}, inset 0 0 0 1px ${colorPrimary};
  }

  &:disabled,
  &[disabled] {
    cursor: not-allowed;
    opacity: .75;
    background-color: rgba(167,179,189,0.25);
  }
`;

export default {
  TimerSidebarContent,
  TimerHeader,
  TimerTitle,
  TimerMinimizeButton,
  TimerContent,
  TimerCurrent,
  TimerType,
  TimerSwitchButton,
  StopwatchTime,
  StopwatchTimeInput,
  StopwatchTimeInputLabel,
  StopwatchTimeColon,
  TimerSongsWrapper,
  TimerSongsTitle,
  TimerTracks,
  TimerTrackItem,
  TimerControls,
  TimerControlButton,
  TimerInput,
};
