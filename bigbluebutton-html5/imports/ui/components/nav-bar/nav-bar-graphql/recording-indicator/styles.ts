import styled, { css } from 'styled-components';
import { fontSizeLarge, fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import {
  mdPadding,
  borderSize,
  borderSizeLarge,
  borderSizeSmall,
  mobileNavbarButtonSize,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorWhite,
  colorDangerDark,
  colorGray,
  btnDefaultGhostBg,
  btnRecordingActiveBg,
  btnRecordingActiveBorder,
} from '/imports/ui/stylesheets/styled-components/palette';
import SpinnerStyles from '/imports/ui/components/common/loading-screen/styles';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

interface RecordingIndicatorIconProps {
  titleMargin: boolean;
  isRTL: boolean;
}

interface RecordingIndicatorProps {
  recording: boolean;
  disabled: boolean;
  time: number;
  isPhone?: boolean;
}

interface RecordingStatusViewOnlyProps {
  recording: boolean;
}

interface SpinnerOverlayProps {
  animations: boolean;
}

const RecordingIndicatorIcon = styled.span<RecordingIndicatorIconProps>`
  width: ${fontSizeLarge};
  height: ${fontSizeLarge};
  font-size: ${fontSizeBase};
  user-select: none;

  @media ${smallOnly} {
    width: 1rem;
    height: 1rem;
    font-size: 1rem;
  }

  ${({ isRTL, titleMargin }) => isRTL && titleMargin && `
      margin-left: ${mdPadding};
  `}

  ${({ isRTL, titleMargin }) => !isRTL && titleMargin && `
      margin-right: ${mdPadding};
  `}
`;

// Defined above RecordingControl so its rules can target this as a selector.
const PresentationTitle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-weight: 400;
  color: ${colorWhite};
  font-size: ${fontSizeBase};
  padding: 0;
  margin-right: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 30vw;

  & > [class^='icon-bbb-'] {
    font-size: 75%;
  }

  span {
    vertical-align: middle;
  }
`;

// Sits next to the dot for the whole recording session, so the elapsed time is
// readable without hovering. Defined above RecordingControl to be targetable.
const RecordingTimer = styled.span`
  display: flex;
  align-items: center;
  font-weight: 400;
  color: ${colorWhite};
  font-size: ${fontSizeBase};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  margin-left: ${mdPadding};

  [dir="rtl"] & {
    margin-right: ${mdPadding};
    margin-left: 0;
  }
`;

// Same box as the nav bar's plugin buttons, so this one reads as their sibling.
const NAV_BAR_BUTTON_SIZE = '2.25rem';

// Rests as an icon-only circle and reveals the label on hover. The height is
// pinned so it cannot drift with font metrics; `borderWidth` is subtracted from
// the padding so bordered and borderless states close the same box.
const collapsedOnRest = (borderWidth: string) => css`
  height: ${NAV_BAR_BUTTON_SIZE};
  padding: 0 calc((${NAV_BAR_BUTTON_SIZE} - ${fontSizeLarge}) / 2 - ${borderWidth});
  transition: padding 0.2s ease;

  ${RecordingIndicatorIcon} {
    margin: 0;
    transition: margin 0.2s ease;
  }

  ${PresentationTitle} {
    max-width: 0;
    opacity: 0;
    transition: max-width 0.2s ease, opacity 0.2s ease;
  }

  /* :focus-visible so keyboard users can reach the label too. */
  &:hover,
  &:focus-visible {
    padding: 0 calc(1rem - ${borderWidth});

    ${RecordingIndicatorIcon} {
      margin-right: ${mdPadding};
    }

    /* Close to the longest label, so the collapse has no dead zone. */
    ${PresentationTitle} {
      max-width: 12rem;
      opacity: 1;
    }
  }

  [dir="rtl"] &:hover ${RecordingIndicatorIcon},
  [dir="rtl"] &:focus-visible ${RecordingIndicatorIcon} {
    margin-right: 0;
    margin-left: ${mdPadding};
  }
`;

// While recording the button rests as a pill holding the dot and the timer, so
// it never shrinks to a circle. Only the action label collapses.
const labelCollapsedOnRest = css`
  /* Same pinned box as the idle state. border-box because this state is the
     only one with a rendered border, and there is no global box-sizing reset -
     without it the 1px outline would make the recording button 2px taller than
     its idle self and than the plugin buttons beside it. */
  box-sizing: border-box;
  height: ${NAV_BAR_BUTTON_SIZE};
  padding: 0 calc(1rem - ${borderSizeSmall});
  transition: padding 0.2s ease;

  /* The timer owns the gap after the dot. */
  ${RecordingIndicatorIcon} {
    margin: 0;
  }

  ${PresentationTitle} {
    max-width: 0;
    opacity: 0;
    margin-left: 0;
    transition: max-width 0.2s ease, opacity 0.2s ease, margin 0.2s ease;
  }

  &:hover ${PresentationTitle},
  &:focus-visible ${PresentationTitle} {
    max-width: 12rem;
    opacity: 1;
    margin-left: ${mdPadding};
  }

  [dir="rtl"] &:hover ${PresentationTitle},
  [dir="rtl"] &:focus-visible ${PresentationTitle} {
    margin-right: ${mdPadding};
    margin-left: 0;
  }
`;

const RecordingControl = styled.button<RecordingIndicatorProps>`
  display: flex;
  align-items: center;
  user-select: none;
  background: ${btnDefaultGhostBg};

  &:hover {
    outline-style: solid;
    outline: transparent dotted 2px;
  }

  &:hover:not(:disabled) {
    color: ${colorWhite} !important;
    cursor: pointer;
  }

  &:focus {
    background-clip: padding-box;
    outline: transparent dotted 2px;
    box-shadow: 0 0 0 ${borderSizeLarge} ${colorWhite};
  }

  /* Drop the ring on pointer focus: clicking would otherwise leave the button
     looking bigger than the plugin buttons beside it. Keyboard focus keeps it. */
  &:focus:not(:focus-visible) {
    box-shadow: none;
  }

  &:active {
    transform: scale(0.95);
    box-shadow: 0 0 0 ${borderSizeSmall} ${colorWhite};
  }

  /* Recording: a pill with the red outline, showing the dot and the elapsed
     time at rest. Hover only adds the stop label. */
  ${({ recording, isPhone, disabled }) => recording && css`
    padding: calc(0.5rem - ${borderSizeSmall}) calc(1rem - ${borderSizeSmall});
    background-color: ${btnRecordingActiveBg};
    border: ${borderSizeSmall} solid ${btnRecordingActiveBorder};
    border-radius: 2em;

    &:focus {
      box-shadow: 0 0 0 ${borderSize} ${btnRecordingActiveBorder};
    }

    &:focus:not(:focus-visible) {
      box-shadow: none;
    }

    ${!isPhone && !disabled && labelCollapsedOnRest}
  `}

  /* Idle: borderless, so nothing to compensate. */
  ${({ recording, isPhone, disabled }) => !recording && css`
    padding: 0.5rem 1rem;
    border: ${borderSizeSmall};
    border-radius: 2em;

    ${!isPhone && !disabled && collapsedOnRest('0px')}
  `}

  ${({ disabled, time }) => disabled && time === 0 && css`
    display: none;
  `}

  ${({ disabled, time }) => disabled && time > 0 && css`
    cursor: not-allowed;
    pointer-events: none;
  `}

  ${({ isPhone, recording }) => isPhone && !recording && css`
    justify-content: center;
  `}

  /* Small viewports keep the nav bar's own circular button box, so these come
     last and win over the collapsed metrics above. */
  ${({ recording }) => !recording && `
    @media ${smallOnly} {
      width: ${mobileNavbarButtonSize};
      height: ${mobileNavbarButtonSize};
      min-width: ${mobileNavbarButtonSize};
      padding: 0 !important;
      border-radius: 50% !important;
      justify-content: center;
    }
  `}

  ${({ recording }) => recording && `
    @media ${smallOnly} {
      height: ${mobileNavbarButtonSize};
      padding: 0 0.6rem !important;
      align-items: center;
    }
  `}
`;

const VisuallyHidden = styled.span`
  position: absolute;
  overflow: hidden;
  clip: rect(0 0 0 0);
  height: 1px;
  width: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
`;

const PresentationTitleSeparator = styled.span`
  color: ${colorGray};
  font-size: ${fontSizeBase};
  margin: 0 1rem;
`;

const RecordingIndicator = styled.div<RecordingIndicatorProps>`
  padding-right: 0.5rem;

  ${({ isPhone }) => isPhone && `
    margin-left: 0;
    padding-right: 0;
  `}


`;

const RecordingStatusViewOnly = styled.div<RecordingStatusViewOnlyProps>`
  display: flex;

  ${({ recording }) => recording && `
    padding: 5px 5px 5px 5px;
    background-color: ${colorDangerDark};
    border: ${borderSizeLarge} solid ${colorDangerDark};
    border-radius: 10px;
  `}
`;

const SpinnerOverlay = styled(SpinnerStyles.Spinner)<SpinnerOverlayProps>`
  & > div {
    background-color: ${colorWhite};;
    height: 0.5625rem;
    width: 0.5625rem;
  }
`;

const Bounce1 = styled(SpinnerStyles.Bounce1)<SpinnerOverlayProps>`
  height: 0.5625rem;
  width: 0.5625rem;
`;

const Bounce2 = styled(SpinnerStyles.Bounce2)<SpinnerOverlayProps>`
  height: 0.5625rem;
  width: 0.5625rem;
`;

export default {
  RecordingIndicatorIcon,
  RecordingControl,
  RecordingTimer,
  PresentationTitle,
  VisuallyHidden,
  PresentationTitleSeparator,
  RecordingIndicator,
  RecordingStatusViewOnly,
  SpinnerOverlay,
  Bounce1,
  Bounce2,
};
