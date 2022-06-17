import styled from 'styled-components';
import Icon from '/imports/ui/components/common/icon/component';
import {
  btnSpacing,
  borderRadius,
  borderSize,
  borderSizeLarge,
  smPaddingY,
  smPaddingX,
  mdPaddingY,
  mdPaddingX,
  lgPaddingY,
  lgPaddingX,
  jumboPaddingY,
  jumboPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeSmall,
  fontSizeBase,
  fontSizeLarge,
  btnFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';
import {
  btnDefaultColor,
  btnDefaultBg,
  btnPrimaryBorder,
  btnPrimaryColor,
  btnPrimaryBg,
  btnSuccessBorder,
  btnSuccessColor,
  btnSuccessBg,
  btnWarningBorder,
  btnWarningColor,
  btnWarningBg,
  btnDangerBorder,
  btnDangerColor,
  btnDangerBg,
  btnDarkBorder,
  btnDarkColor,
  btnDarkBg,
  btnOfflineBorder,
  btnOfflineColor,
  btnOfflineBg,
  btnMutedBorder,
  btnMutedColor,
  btnMutedBg,
} from '/imports/ui/stylesheets/styled-components/palette';
import BaseButton from './base/component';

const ButtonIcon = styled(Icon)`
  width: 1em;
  text-align: center;

  .buttonWrapper & {
    font-size: 125%;
  }

  & + span {
    margin: 0 0 0 ${btnSpacing};

    [dir="rtl"] & {
      margin: 0 ${btnSpacing} 0 0;
    }
  }
  .buttonWrapper:hover & {
    opacity: .75;
  }
`;

const EmojiButtonSibling = styled.span`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
`;

const ButtonLabel = styled.span`
  & + i,
  & + button {
    margin: 0 0 0 ${btnSpacing};

    [dir="rtl"] & {
      margin: 0 ${btnSpacing} 0 0;
    }
  }
  &:hover,
  .buttonWrapper:hover & {
    opacity: .5;
  }

  ${({ hideLabel }) => hideLabel && `
    font-size: 0;
    height: 0;
    width: 0;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden;
    display: none !important;
  `}
`;

const ButtonWrapper = styled(BaseButton)`
  border: none;
  overflow: visible !important;
  display: inline-block;
  cursor: pointer;

  &:focus,
  &:hover {
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
  }

  &:focus {
    outline-style: solid;
  }

  &:-moz-focusring {
    outline-color: transparent;
    outline-offset: ${borderRadius};
  }

  &:active {
    &:focus {
      span:first-of-type::before {
        border-radius: 50%;
        outline: transparent;
        outline-width: ${borderSize};
        outline-style: solid;
      }
    }
  }

  line-height: 1.5;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  background: none;
  padding: 0 !important;

  &[aria-disabled="true"] > span {
    cursor: not-allowed;
    opacity: .65;
    box-shadow: none;
  }

  ${({ size }) => size === 'sm' && `
    font-size: calc(${fontSizeSmall} * .85);
    padding: ${smPaddingY} ${smPaddingX};

    & > label {
      display: inline-block;
      margin: 0 0 0 ${btnSpacing};

      [dir="rtl"] & {
        margin:0 ${btnSpacing} 0 0;
      }
    }
  `}

  ${({ size }) => size === 'md' && `
    font-size: calc(${fontSizeBase} * .85);
    padding: ${mdPaddingY} ${mdPaddingX};
  `}

  ${({ size }) => size === 'lg' && `
    font-size: calc(${fontSizeLarge} * .85);
    padding: ${lgPaddingY} ${lgPaddingX};
  `}

  ${({ size }) => size === 'jumbo' && `
    font-size: 3rem;
    padding: ${jumboPaddingY} ${jumboPaddingX};
  `}

  & > span {
    display: block;
    text-align: center;
    white-space: nowrap;
  }
`;

const ButtonSpan = styled.span`
  border: none;
  overflow: visible;
  display: inline-block;
  border-radius: ${borderSize};
  font-weight: ${btnFontWeight};
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;

  &:-moz-focusring {
    outline: none;
  }

  &:hover,
  &:focus {
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
    text-decoration: none;
  }

  &:active,
  &:focus {
    outline: transparent;
    outline-width: ${borderSize};
    outline-style: solid;
  }

  &:active {
    background-image: none;
  }

  &[aria-disabled="true"] {
    cursor: not-allowed;
    opacity: .65;
    box-shadow: none;
  }

  &,
  &:active {
    &:focus {
      span:first-of-type::before {
        border-radius: ${borderSize};
      }
    }
  }

  ${({ size }) => size === 'sm' && `
    font-size: calc(${fontSizeSmall} * .85);
    padding: ${smPaddingY} ${smPaddingX};
  `}

  ${({ size }) => size === 'md' && `
    font-size: calc(${fontSizeBase} * .85);
    padding: ${mdPaddingY} ${mdPaddingX};
  `}

  ${({ size }) => size === 'lg' && `
    font-size: calc(${fontSizeLarge} * .85);
    padding: ${lgPaddingY} ${lgPaddingX};
  `}

  ${({ size }) => size === 'jumbo' && `
    font-size: 3rem;
    padding: ${jumboPaddingY} ${jumboPaddingX};
  `}

  ${({ color, ghost }) => color === 'default' && !ghost && `
    color: ${btnDefaultColor};
    background-color: ${btnDefaultBg};
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus:not([aria-disabled="true"]) & {
      color: ${btnDefaultColor};
      background-color: ${btnDefaultBg};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSize} ${btnPrimaryBorder};
    }

    &:hover & {
      color: ${btnDefaultBg};
    }
  `}

  ${({ color }) => color === 'primary' && `
    color: ${btnPrimaryColor};
    background-color: ${btnPrimaryBg};
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus:not([aria-disabled="true"]) & {
      color: ${btnPrimaryColor};
      background-color: ${btnPrimaryBg};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSize} ${btnPrimaryBorder};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnPrimaryColor};
    }
  `}

  ${({ color }) => color === 'success' && `
    color: ${btnSuccessColor};
    background-color: ${btnSuccessBg};
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus:not([aria-disabled="true"]) & {
      color: ${btnSuccessColor};
      background-color: ${btnSuccessBg};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSize} ${btnSuccessBorder};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnSuccessColor};
    }
  `}

  ${({ color }) => color === 'warning' && `
    color: ${btnWarningColor};
    background-color: ${btnWarningBg};
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus:not([aria-disabled="true"]) & {
      color: ${btnWarningColor};
      background-color: ${btnWarningBg};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSize} ${btnWarningBorder};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnWarningColor};
    }
  `}

  ${({ color }) => color === 'danger' && `
    color: ${btnDangerColor};
    background-color: ${btnDangerBg};
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus:not([aria-disabled="true"]) & {
      color: ${btnDangerColor};
      background-color: ${btnDangerBg};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSize} ${btnDangerBorder};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnDangerColor};
    }
  `}

  ${({ color }) => color === 'dark' && `
    color: ${btnDarkColor};
    background-color: ${btnDarkBg};
    border: ${borderSizeLarge} solid transparent;

    &:focus {
      color: ${btnDarkColor};
      background-color: ${btnDarkBg};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSize} ${btnDarkBorder};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnDarkColor};
    }
  `}

  ${({ color }) => color === 'offline' && `
    color: ${btnOfflineColor};
    background-color: ${btnOfflineBg};
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus:not([aria-disabled="true"]) & {
      color: ${btnOfflineColor};
      background-color: ${btnOfflineBg};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSize} ${btnOfflineBorder};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnOfflineColor};
    }
  `}

  ${({ color }) => color === 'muted' && `
    color: ${btnMutedColor};
    background-color: ${btnMutedBg};
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus:not([aria-disabled="true"]) & {
      color: ${btnMutedColor};
      background-color: ${btnMutedBg};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSize} ${btnMutedBorder};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnMutedColor};
    }
  `}

  ${({ ghost, color }) => ghost && color === 'default' && `
    color: ${btnDefaultBg};
    background-image: none;
    background-color: transparent;
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus & {
      color: ${btnDefaultBg};
      background-color: ${btnDefaultColor};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSizeLarge} ${btnDefaultBg} !important;
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnDefaultBg};
      background-color: ${btnDefaultColor};
    }
  `}

  ${({ ghost, color }) => ghost && color === 'primary' && `
    color: ${btnPrimaryBg};
    background-image: none;
    background-color: transparent;
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus & {
      color: ${btnPrimaryBg};
      background-color: ${btnPrimaryColor};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSizeLarge} ${btnPrimaryBg};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnPrimaryBg};
      background-color: ${btnPrimaryColor};
    }
  `}

  ${({ ghost, color }) => ghost && color === 'success' && `
    color: ${btnSuccessBg};
    background-image: none;
    background-color: transparent;
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus & {
      color: ${btnSuccessBg};
      background-color: ${btnSuccessColor};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSizeLarge} ${btnSuccessBg};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnSuccessBg};
      background-color: ${btnSuccessColor};
    }
  `}

  ${({ ghost, color }) => ghost && color === 'warning' && `
    color: ${btnWarningBg};
    background-image: none;
    background-color: transparent;
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus & {
      color: ${btnWarningBg};
      background-color: ${btnWarningColor};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSizeLarge} ${btnWarningBg};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnWarningBg};
      background-color: ${btnWarningColor};
    }
  `}

  ${({ ghost, color }) => ghost && color === 'danger' && `
    color: ${btnDangerBg};
    background-image: none;
    background-color: transparent;
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus & {
      color: ${btnDangerBg};
      background-color: ${btnDangerColor};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSizeLarge} ${btnDangerBg};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnDangerBg};
      background-color: ${btnDangerColor};
    }
  `}

  ${({ ghost, color }) => ghost && color === 'dark' && `
    color: ${btnDarkBg};
    background-image: none;
    background-color: transparent;
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus & {
      color: ${btnDarkBg};
      background-color: ${btnDarkColor};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSizeLarge} ${btnDarkBg};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnDarkBg};
      background-color: ${btnDarkColor};
    }
  `}

  ${({ ghost, color }) => ghost && color === 'offline' && `
    color: ${btnOfflineBg};
    background-image: none;
    background-color: transparent;
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus & {
      color: ${btnOfflineBg};
      background-color: ${btnOfflineColor};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSizeLarge} ${btnOfflineBg};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnOfflineBg};
      background-color: ${btnOfflineColor};
    }
  `}

  ${({ ghost, color }) => ghost && color === 'muted' && `
    color: ${btnMutedBg};
    background-image: none;
    background-color: transparent;
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus & {
      color: ${btnMutedBg};
      background-color: ${btnMutedColor};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSizeLarge} ${btnMutedBg};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnMutedBg};
      background-color: ${btnMutedColor};
    }
  `}

  ${({ circle }) => circle && `
    border-radius: 50%;
  `}

  ${({ circle, size }) => circle && size === 'sm' && `
    padding: calc(${smPaddingX} / 2);
  `}

  ${({ circle, size }) => circle && size === 'md' && `
    padding: calc(${mdPaddingX} / 2);
  `}

  ${({ circle, size }) => circle && size === 'lg' && `
    padding: calc(${lgPaddingX} / 2);
  `}

  ${({ circle, size }) => circle && size === 'jumbo' && `
    padding: calc(${jumboPaddingX} / 2);
  `}

  ${({ block }) => block && `
    display: block;
    width: 100%;
  `}
`;

const Button = styled(BaseButton)`
  border: none;
  overflow: visible;
  display: inline-block;
  border-radius: ${borderSize};
  font-weight: ${btnFontWeight};
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;

  &:-moz-focusring {
    outline: none;
  }

  &:hover,
  &:focus {
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
    text-decoration: none;
  }

  &:active,
  &:focus {
    outline: transparent;
    outline-width: ${borderSize};
    outline-style: solid;
  }

  &:active {
    background-image: none;
  }

  &[aria-disabled="true"] {
    cursor: not-allowed;
    opacity: .65;
    box-shadow: none;
  }

  &,
  &:active {
    &:focus {
      span:first-of-type::before {
        border-radius: ${borderSize};
      }
    }
  }

  ${({ size }) => size === 'sm' && `
    font-size: calc(${fontSizeSmall} * .85);
    padding: ${smPaddingY} ${smPaddingX};
  `}

  ${({ size }) => size === 'md' && `
    font-size: calc(${fontSizeBase} * .85);
    padding: ${mdPaddingY} ${mdPaddingX};
  `}

  ${({ size }) => size === 'lg' && `
    font-size: calc(${fontSizeLarge} * .85);
    padding: ${lgPaddingY} ${lgPaddingX};
  `}

  ${({ size }) => size === 'jumbo' && `
    font-size: 3rem;
    padding: ${jumboPaddingY} ${jumboPaddingX};
  `}

  ${({ color }) => color === 'default' && `
    color: ${btnDefaultColor};
    background-color: ${btnDefaultBg};
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus:not([aria-disabled="true"]) & {
      color: ${btnDefaultColor};
      background-color: ${btnDefaultBg};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSize} ${btnPrimaryBorder};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnDefaultColor};
    }
  `}

  ${({ color }) => color === 'primary' && `
    color: ${btnPrimaryColor};
    background-color: ${btnPrimaryBg};
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus:not([aria-disabled="true"]) & {
      color: ${btnPrimaryColor};
      background-color: ${btnPrimaryBg};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSize} ${btnPrimaryBorder};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnPrimaryColor};
    }
  `}

  ${({ color }) => color === 'success' && `
    color: ${btnSuccessColor};
    background-color: ${btnSuccessBg};
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus:not([aria-disabled="true"]) & {
      color: ${btnSuccessColor};
      background-color: ${btnSuccessBg};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSize} ${btnSuccessBorder};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnSuccessColor};
    }
  `}

  ${({ color }) => color === 'warning' && `
    color: ${btnWarningColor};
    background-color: ${btnWarningBg};
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus:not([aria-disabled="true"]) & {
      color: ${btnWarningColor};
      background-color: ${btnWarningBg};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSize} ${btnWarningBorder};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnWarningColor};
    }
  `}

  ${({ color }) => color === 'danger' && `
    color: ${btnDangerColor};
    background-color: ${btnDangerBg};
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus:not([aria-disabled="true"]) & {
      color: ${btnDangerColor};
      background-color: ${btnDangerBg};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSize} ${btnDangerBorder};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnDangerColor};
    }
  `}

  ${({ color }) => color === 'dark' && `
    color: ${btnDarkColor};
    background-color: ${btnDarkBg};
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus:not([aria-disabled="true"]) & {
      color: ${btnDarkColor};
      background-color: ${btnDarkBg};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSize} ${btnDarkBorder};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnDarkColor};
    }
  `}

  ${({ color }) => color === 'offline' && `
    color: ${btnOfflineColor};
    background-color: ${btnOfflineBg};
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus:not([aria-disabled="true"]) & {
      color: ${btnOfflineColor};
      background-color: ${btnOfflineBg};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSize} ${btnOfflineBorder};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnOfflineColor};
    }
  `}

  ${({ color }) => color === 'muted' && `
    color: ${btnMutedColor};
    background-color: ${btnMutedBg};
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus:not([aria-disabled="true"]) & {
      color: ${btnMutedColor};
      background-color: ${btnMutedBg};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSize} ${btnMutedBorder};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnMutedColor};
    }
  `}

  ${({ ghost, color }) => ghost && color === 'default' && `
    color: ${btnDefaultBg};
    background-image: none;
    background-color: transparent;
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus & {
      color: ${btnDefaultBg};
      background-color: ${btnDefaultColor};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSizeLarge} ${btnDefaultBg};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnDefaultBg};
      background-color: ${btnDefaultColor};
    }
  `}

  ${({ ghost, color }) => ghost && color === 'primary' && `
    color: ${btnPrimaryBg};
    background-image: none;
    background-color: transparent;
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus & {
      color: ${btnPrimaryBg};
      background-color: ${btnPrimaryColor};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSizeLarge} ${btnPrimaryBg};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnPrimaryBg};
      background-color: ${btnPrimaryColor};
    }
  `}

  ${({ ghost, color }) => ghost && color === 'success' && `
    color: ${btnSuccessBg};
    background-image: none;
    background-color: transparent;
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus & {
      color: ${btnSuccessBg};
      background-color: ${btnSuccessColor};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSizeLarge} ${btnSuccessBg};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnSuccessBg};
      background-color: ${btnSuccessColor};
    }
  `}

  ${({ ghost, color }) => ghost && color === 'warning' && `
    color: ${btnWarningBg};
    background-image: none;
    background-color: transparent;
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus & {
      color: ${btnWarningBg};
      background-color: ${btnWarningColor};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSizeLarge} ${btnWarningBg};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnWarningBg};
      background-color: ${btnWarningColor};
    }
  `}

  ${({ ghost, color }) => ghost && color === 'danger' && `
    color: ${btnDangerBg};
    background-image: none;
    background-color: transparent;
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus & {
      color: ${btnDangerBg};
      background-color: ${btnDangerColor};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSizeLarge} ${btnDangerBg};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnDangerBg};
      background-color: ${btnDangerColor};
    }
  `}

  ${({ ghost, color }) => ghost && color === 'dark' && `
    color: ${btnDarkBg};
    background-image: none;
    background-color: transparent;
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus & {
      color: ${btnDarkBg};
      background-color: ${btnDarkColor};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSizeLarge} ${btnDarkBg};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnDarkBg};
      background-color: ${btnDarkColor};
    }
  `}

  ${({ ghost, color }) => ghost && color === 'offline' && `
    color: ${btnOfflineBg};
    background-image: none;
    background-color: transparent;
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus & {
      color: ${btnOfflineBg};
      background-color: ${btnOfflineColor};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSizeLarge} ${btnOfflineBg};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnOfflineBg};
      background-color: ${btnOfflineColor};
    }
  `}

  ${({ ghost, color }) => ghost && color === 'muted' && `
    color: ${btnMutedBg};
    background-image: none;
    background-color: transparent;
    border: ${borderSizeLarge} solid transparent;

    &:focus,
    .buttonWrapper:focus & {
      color: ${btnMutedBg};
      background-color: ${btnMutedColor};
      background-clip: padding-box;
      box-shadow: 0 0 0 ${borderSizeLarge} ${btnMutedBg};
    }

    &:hover,
    .buttonWrapper:hover & {
      color: ${btnMutedBg};
      background-color: ${btnMutedColor};
    }
  `}

  ${({ circle }) => circle && `
    border-radius: 50%;
  `}

  ${({ circle, size }) => circle && size === 'sm' && `
    padding: calc(${smPaddingX} / 2);
  `}

  ${({ circle, size }) => circle && size === 'md' && `
    padding: calc(${mdPaddingX} / 2);
  `}

  ${({ circle, size }) => circle && size === 'lg' && `
    padding: calc(${lgPaddingX} / 2);
  `}

  ${({ circle, size }) => circle && size === 'jumbo' && `
    padding: calc(${jumboPaddingX} / 2);
  `}

  ${({ block }) => block && `
    display: block;
    width: 100%;
  `}

  ${({ iconRight }) => iconRight && `
    display: flex;
    flex-direction: row-reverse;
  `}
`;

export default {
  ButtonIcon,
  EmojiButtonSibling,
  ButtonLabel,
  ButtonWrapper,
  ButtonSpan,
  Button,
};
