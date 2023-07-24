import styled, { css } from 'styled-components';
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

export const MuteToggleButton = styled(Button)`
  margin-right: 0.5rem;
  ${({ ghost }) =>
    ghost &&
    `
    span {
      box-shadow: none;
      background-color: transparent !important;
      border-color: ${colorWhite} !important;
    }
  `}

  ${({ $talking }) =>
    $talking &&
    `
    border-radius: 50%;
  `}

  ${({ $talking, animations }) =>
    $talking &&
    animations &&
    css`
      animation: ${pulse} 1s infinite ease-in;
    `}

  ${({ $talking, animations }) =>
    $talking &&
    !animations &&
    css`
      & span {
        content: '';
        outline: none !important;
        background-clip: padding-box;
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.5);
      }
    `}
`;

export const DisabledLabel = {
  color: colorGrayDark,
  fontWeight: 'bold',
  opacity: 1,
};

export const SelectedLabel = {
  color: colorPrimary,
  backgroundColor: colorOffWhite,
};

export const DangerColor = {
  color: colorDanger,
  paddingLeft: 12,
};

export const AudioDropdown = styled(ButtonEmoji)`
  span {
    i {
      width: 0px !important;
      bottom: 1px;
    }
  }
`;

export default {
  MuteToggleButton,
  DisabledLabel,
  SelectedLabel,
  DangerColor,
  AudioDropdown,
};
