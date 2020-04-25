import styled from 'styled-components';
import {
  borderSize,
  borderSizeLarge,
  mdPaddingX,
  mdPaddingY,
  pollHeaderOffset,
  toastContentWidth,
} from '../../stylesheets/styled-components/general';
import { colorGrayDark, colorWhite } from '../../stylesheets/styled-components/palette';
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
  height: 100vh;
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

const TimerControls = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
`;

const TimerControlButton = styled(Button)`
  width: 6rem;
  margin: 0 1rem;
`;

export default {
  TimerSidebarContent,
  TimerHeader,
  TimerTitle,
  TimerMinimizeButton,
  TimerContent,
  TimerType,
  TimerSwitchButton,
  TimerControls,
  TimerControlButton,
};