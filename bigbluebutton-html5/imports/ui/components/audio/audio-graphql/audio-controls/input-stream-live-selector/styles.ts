/* eslint-disable @typescript-eslint/ban-ts-comment */
import styled, { css, keyframes } from 'styled-components';
import ButtonEmoji from '/imports/ui/components/common/button/button-emoji/ButtonEmoji';
import Button from '/imports/ui/components/common/button/component';
import {
  colorPrimary,
  colorDanger,
  colorGrayDark,
  colorOffWhite,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import { smPaddingY, smPadding } from '/imports/ui/stylesheets/styled-components/general';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

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

// @ts-ignore - as button comes from JS, we can't provide its props
export const MuteToggleButton = styled(Button)`
  ${({ ghost }) => ghost && `
    span {
      box-shadow: none;
      background-color: transparent !important;
      border-color: ${colorWhite} !important;
    }
  `}

  ${({ $talking }) => $talking && `
    border-radius: 50%;
  `}

  ${({ $talking, animations }) => $talking && animations && css`
      animation: ${pulse} 1s infinite ease-in;
    `}

  ${({ $talking, animations }) => $talking && !animations && css`
      & span {
        content: '';
        outline: none !important;
        background-clip: padding-box;
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.5);
      }
    `}
  
      @media ${smallOnly} {
        margin-right: ${smPaddingY};
      }
  
      [dir='rtl'] & {
        margin-right: 0;
        margin-left: -${smPadding};
  
        @media ${smallOnly} {
          margin-left: ${smPaddingY};
        }
      }
    }
`;

export const DisabledLabel = {
  color: colorGrayDark,
  fontWeight: 'bold',
  opacity: 1,
};

export const AudioSettingsOption = {
  paddingLeft: 12,
};

export const SelectedLabel = {
  color: colorPrimary,
  backgroundColor: colorOffWhite,
};

export const DangerColor = {
  color: colorDanger,
  paddingLeft: 12,
};

// @ts-ignore - as button comes from JS, we can't provide its props
export const AudioDropdown = styled(ButtonEmoji)`
  span {
    i {
      width: 10px !important;
      bottom: 1px;
    }
  }
`;

export default {
  MuteToggleButton,
  DisabledLabel,
  SelectedLabel,
  AudioSettingsOption,
  DangerColor,
  AudioDropdown,
};
