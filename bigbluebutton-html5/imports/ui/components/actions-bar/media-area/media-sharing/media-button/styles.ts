import {
  colorGrayUserListToolbar, btnDefaultColor, btnPrimaryBg, btnPrimaryColor,
  colorText, colorBlueAux,
} from '/imports/ui/stylesheets/styled-components/palette';
import { borderSize, borderSizeLarge } from '/imports/ui/stylesheets/styled-components/general';
import { ButtonBase } from '@mui/material';
import styled from 'styled-components';

const btnBorder = 'var(--btn-default-border, #B0BDC9)';

// Outer container for the media button.
const MediaButtonContainer = styled.div`
  width: 5rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;

// A customized Material-UI Button used as the button frame.
interface ButtonFrameProps {
  color: string;
}

const ButtonFrame = styled(ButtonBase)<ButtonFrameProps>`
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 16px !important;
  border: 1px solid ${btnBorder} !important;
  padding: 0.5rem !important;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-transform: none;
  position: relative;
  transition: opacity 0.2s ease-in-out;

  ${({ color }) => color === 'default' && `
    color: ${btnDefaultColor} !important;
    background-color: ${colorGrayUserListToolbar} !important;
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus:not([aria-disabled="true"]) & {
      color: ${btnDefaultColor} !important;
      background-color: ${colorGrayUserListToolbar} !important;
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSize} ${btnPrimaryBg};
    }

    &:hover {
      opacity: 0.8;
    }
  `}

  ${({ color }) => color === 'primary' && `
    color: ${btnPrimaryColor} !important;
    background-color: ${btnPrimaryBg} !important;
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus:not([aria-disabled="true"]) & {
      color: ${btnPrimaryColor} !important;
      background-color: ${btnPrimaryBg} !important;
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSize} ${btnPrimaryBg};
    }

    &:hover {
      opacity: 0.8;
    }
  `}

  ${({ color }) => color === 'active' && `
    background-color: ${colorBlueAux} !important;
    border: 0 !important;

    &:focus,
    .buttonWrapper:focus:not([aria-disabled="true"]) & {
      color: ${btnPrimaryColor} !important;
      background-color: ${colorBlueAux} !important;
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSize} ${btnPrimaryBg};
    }

    &:hover {
      opacity: 0.8;
    }
  `}
`;

// Positioned settings icon in the top right corner of the button.
const SettingsContainer = styled.div`
  position: absolute;
  top: 0rem;
  right: -0.1rem;

  ${({ color }) => color === 'default' && `
    color: ${btnDefaultColor} !important;
  `}

  ${({ color }) => color === 'active' && `
    color: ${btnPrimaryBg} !important;
  `}
`;

// Wrapper for the main placeholder icon.
const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;

  > i {
    font-size: 200%;
  }
`;

// Text label displayed below the button.
const ButtonText = styled.div`
  color: ${colorText};
  width: 100%;
  text-align: center;
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export default {
  MediaButtonContainer,
  ButtonFrame,
  SettingsContainer,
  IconWrapper,
  ButtonText,
};
