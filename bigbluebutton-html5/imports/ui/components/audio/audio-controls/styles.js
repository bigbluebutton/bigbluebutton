import styled, { css, keyframes } from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { smPaddingX, smPaddingY } from '/imports/ui/stylesheets/styled-components/general';

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 white;
  }
  70% {
    box-shadow: 0 0 0 0.5625rem transparent;
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
`;

const AudioControlsButton = styled(Button)`
  span {
    box-shadow: none;
    background-color: transparent !important;
    border-color: ${colorWhite} !important;
  }
`;

const LeaveButtonWithoutLiveStreamSelector = styled(Button)`
  ${({ ghost }) => ghost && `
    span {
      box-shadow: none;
      background-color: transparent !important;
      border-color: ${colorWhite} !important;
    }
  `}
`;

const MuteToggleButton = styled(Button)`
  margin-right: ${smPaddingX};
  margin-left: 0;

  @media ${smallOnly} {
    margin-right: ${smPaddingY};
  }

  [dir="rtl"] & {
    margin-left: ${smPaddingX};
    margin-right: 0;

    @media ${smallOnly} {
      margin-left: ${smPaddingY};
    }
  }

  ${({ ghost }) => ghost && `
    span {
      box-shadow: none;
      background-color: transparent !important;
      border-color: ${colorWhite} !important;
    }
  `}

  ${({ talking }) => talking && `
    border-radius: 50%;
  `}
    
  ${({ talking, animations }) => talking && animations && css`
    animation: ${pulse} 1s infinite ease-in;
  `}

  ${({ talking, animations }) => talking && !animations && css`
    & span {
      content: '';
      outline: none !important;
      background-clip: padding-box;
      box-shadow: 0 0 0 4px rgba(255,255,255,.5);
    }
  `}
`;

const Container = styled.span`
  display: flex;
  flex-flow: row;
  position: relative;

  & > div {
    position: relative;
  }
  
  & > :last-child {
    margin-left: ${smPaddingX};
    margin-right: 0;

    @media ${smallOnly} {
      margin-left: ${smPaddingY};
    }

    [dir="rtl"] & {
      margin-left: 0;
      margin-right: ${smPaddingX};

      @media ${smallOnly} {
        margin-right: ${smPaddingY};
      }
    }
  }
`;

export default {
  AudioControlsButton,
  LeaveButtonWithoutLiveStreamSelector,
  MuteToggleButton,
  Container,
};
