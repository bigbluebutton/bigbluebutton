import styled from 'styled-components';
import { phoneLandscape, smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { borderRadius } from '/imports/ui/stylesheets/styled-components/general';
import {
  colorSuccess,
  colorDanger,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeBase, fontSizeXS } from '/imports/ui/stylesheets/styled-components/typography';

const colorTimerRunning = `${colorSuccess}`;
const colorTimerStopped = `${colorDanger}`;
const timerMarginSM = '.5rem';
const timerPaddingSM = '.25rem';
const timerPaddingXL = '1.62rem';
const timerMaxWidth = '10rem';
const timerFontWeight = '400';
const timerBorderRadius = '2rem';

const TimerWrapper = styled.div`
  overflow: hidden;
  margin-left: auto;
`;

const Timer = styled.div`
  margin-top: 0.5rem;
  display: flex;
  max-height: ${timerPaddingXL});
`;

const timerRunning = `
  background-color: ${colorTimerRunning};
  border: solid 2px ${colorTimerRunning};
`;

const timerStopped = `
  background-color: ${colorTimerStopped};
  border: solid 2px ${colorTimerStopped};
`;

const disabledStyle = `
  cursor: default;
`;

const hiddenStyle = `
  @media ${smallOnly} {
    visibility: hidden;
  }
`;

const TimerButton = styled.div`
  @include highContrastOutline();
  cursor: pointer;
  color: white;
  font-weight: ${timerFontWeight};
  border-radius: ${timerBorderRadius} ${timerBorderRadius};
  font-size: ${fontSizeBase};
  margin-left: ${borderRadius};
  margin-right: ${borderRadius};

  @media ${phoneLandscape} {
    height: 1rem;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: ${timerMaxWidth};

    @media ${phoneLandscape} {
      font-size: ${fontSizeXS};
    }
  }

  i {
    font-size: var(--font-size-small);
    width: 1rem;
    height: 1rem;
    border-radius: 50%;

    @media ${phoneLandscape} {
      height: ${timerMarginSM};
      width: ${timerMarginSM};
      font-size: ${fontSizeXS};
    }
  }

  ${({ running }) => (running ? timerRunning : timerStopped)};
  ${({ disabled }) => disabled && disabledStyle};
  ${({ hide }) => hide && hiddenStyle};
`;

const time = `
  box-sizing: border-box;
  display: flex;
  align-self: center;
  padding: 0 ${timerPaddingSM} 0 0;
`;

const TimerContent = styled.div`
  ${time}
  display: flex;

  [dir="ltr"] & {
    span:first-child {
      padding: 0 ${timerPaddingSM};
    }
  }

  [dir="rtl"] & {
    span:last-child {
      padding: 0 ${timerPaddingSM};
    }
  }
`;

const TimerIcon = styled.span`
  ${time}
`;

const TimerTime = styled.span`
  ${time}
`;

export default {
  TimerWrapper,
  Timer,
  TimerButton,
  TimerContent,
  TimerIcon,
  TimerTime,
};
