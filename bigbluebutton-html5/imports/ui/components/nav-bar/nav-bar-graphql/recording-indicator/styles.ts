import styled, { css } from 'styled-components';
import VisuallyHiddenStyles from '/imports/ui/components/common/visually-hidden/styles';
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
  animations?: boolean;
  autoCollapse?: boolean;
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

// Hysteresis: expanding follows the pointer immediately, collapsing waits.
// Hovering changes the button's width, which shifts the nav bar layout and can
// slide the button out from under the pointer - without this delay that drops
// the hover, collapses, slides back under the pointer and re-hovers, looping
// forever. Holding the expanded width past the un-hover breaks that cycle.
const HOVER_COLLAPSE_DELAY = '0.25s';

// Touch devices latch :hover after a tap, which would leave the button stuck
// open. Gating on a real pointer keeps phones and tablets a plain clickable
// button. Detected by capability rather than by user agent, so a touchscreen
// laptop is handled by how it is being used, not by what it is called.
const HOVER_CAPABLE = '@media (hover: hover) and (pointer: fine)';

// The collapse animates max-width, which cannot be `auto`, so the open state
// needs a number. It is sized by the longest translated label rather than by
// the English one: at 12rem the French, Occitan, Galician, Greek and Italian
// strings were clipped, and the Malayalam stop title is longer still.
const LABEL_MAX_WIDTH = '16rem';

// The button's box when the label rides along at rest. The pinned height is what
// makes it read as a sibling of the nav bar's plugin buttons; `borderWidth` is
// subtracted from the padding so the bordered recording state and the borderless
// idle one close the same box.
const staticBox = (borderWidth: string) => css`
  height: ${NAV_BAR_BUTTON_SIZE};
  padding: 0 calc(1rem - ${borderWidth});
`;

// The opened box, shared by hover and keyboard focus so the two cannot drift.
const expandedMetrics = (borderWidth: string) => css`
  padding: 0 calc(1rem - ${borderWidth});
  /* The expand half of the hysteresis: no delay going out. */
  transition-delay: 0s;

  ${RecordingIndicatorIcon} {
    margin-right: ${mdPadding};
    transition-delay: 0s;
  }

  ${PresentationTitle} {
    max-width: ${LABEL_MAX_WIDTH};
    opacity: 1;
    transition-delay: 0s;
  }
`;

// Rests as an icon-only circle and reveals the label on hover. The height is
// pinned so it cannot drift with font metrics; `borderWidth` is subtracted from
// the padding so bordered and borderless states close the same box.
const collapsedOnRest = (borderWidth: string) => css`
  height: ${NAV_BAR_BUTTON_SIZE};
  padding: 0 calc((${NAV_BAR_BUTTON_SIZE} - ${fontSizeLarge}) / 2 - ${borderWidth});
  transition: padding 0.2s ease ${HOVER_COLLAPSE_DELAY};

  ${RecordingIndicatorIcon} {
    margin: 0;
    transition: margin 0.2s ease ${HOVER_COLLAPSE_DELAY};
  }

  ${PresentationTitle} {
    max-width: 0;
    opacity: 0;
    transition:
      max-width 0.2s ease ${HOVER_COLLAPSE_DELAY},
      opacity 0.2s ease ${HOVER_COLLAPSE_DELAY};
  }

  /* Keyboard focus reveals the label on every device - it needs no pointer. */
  &:focus-visible {
    ${expandedMetrics(borderWidth)}
  }

  [dir="rtl"] &:focus-visible ${RecordingIndicatorIcon} {
    margin-right: 0;
    margin-left: ${mdPadding};
  }

  ${HOVER_CAPABLE} {
    &:hover {
      ${expandedMetrics(borderWidth)}
    }

    [dir="rtl"] &:hover ${RecordingIndicatorIcon} {
      margin-right: 0;
      margin-left: ${mdPadding};
    }
  }
`;

// While recording the button rests as a pill holding the dot and the timer, so
// it never shrinks to a circle. Only the action label collapses, under the same
// asymmetric delay as collapsedOnRest.
const labelCollapsedOnRest = css`
  transition: padding 0.2s ease ${HOVER_COLLAPSE_DELAY};

  /* The timer owns the gap after the dot. */
  ${RecordingIndicatorIcon} {
    margin: 0;
  }

  ${PresentationTitle} {
    max-width: 0;
    opacity: 0;
    margin-left: 0;
    transition:
      max-width 0.2s ease ${HOVER_COLLAPSE_DELAY},
      opacity 0.2s ease ${HOVER_COLLAPSE_DELAY},
      margin 0.2s ease ${HOVER_COLLAPSE_DELAY};
  }

  &:focus-visible ${PresentationTitle} {
    max-width: ${LABEL_MAX_WIDTH};
    opacity: 1;
    margin-left: ${mdPadding};
    transition-delay: 0s;
  }

  [dir="rtl"] &:focus-visible ${PresentationTitle} {
    margin-right: ${mdPadding};
    margin-left: 0;
  }

  ${HOVER_CAPABLE} {
    &:hover ${PresentationTitle} {
      max-width: ${LABEL_MAX_WIDTH};
      opacity: 1;
      margin-left: ${mdPadding};
      transition-delay: 0s;
    }

    [dir="rtl"] &:hover ${PresentationTitle} {
      margin-right: ${mdPadding};
      margin-left: 0;
    }
  }
`;

// A read-only pill (someone who may not record) has pointer-events disabled, so
// its label can never be revealed by hovering and is shown at rest instead. It
// still needs the gap after the timer that the collapsed states animate in.
const labelStaticBesideTimer = css`
  ${PresentationTitle} {
    margin-left: ${mdPadding};
  }

  [dir="rtl"] & ${PresentationTitle} {
    margin-right: ${mdPadding};
    margin-left: 0;
  }
`;

// Reduced motion snaps the collapse instead of sliding it. The delay is kept on
// purpose: it is the hysteresis that breaks the hover/collapse loop described
// above, not decoration, so zeroing it would bring the flicker back.
const instantCollapse = css`
  &,
  ${RecordingIndicatorIcon},
  ${PresentationTitle} {
    transition-duration: 0s;
  }
`;

const RecordingControl = styled.button<RecordingIndicatorProps>`
  display: flex;
  align-items: center;
  user-select: none;
  background: ${btnDefaultGhostBg};

  ${HOVER_CAPABLE} {
    &:hover {
      outline-style: solid;
      outline: transparent dotted 2px;
    }

    &:hover:not(:disabled) {
      color: ${colorWhite} !important;
      cursor: pointer;
    }
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
  ${({
    recording, isPhone, disabled, autoCollapse,
  }) => recording && css`
    ${staticBox(borderSizeSmall)}
    background-color: ${btnRecordingActiveBg};
    border: ${borderSizeSmall} solid ${btnRecordingActiveBorder};
    border-radius: 2em;

    &:focus {
      box-shadow: 0 0 0 ${borderSize} ${btnRecordingActiveBorder};
    }

    &:focus:not(:focus-visible) {
      box-shadow: none;
    }

    ${!isPhone && (autoCollapse && !disabled
    ? labelCollapsedOnRest
    : labelStaticBesideTimer)}
  `}

  /* Idle: borderless, so nothing to compensate. */
  ${({
    recording, isPhone, disabled, autoCollapse,
  }) => !recording && css`
    border: ${borderSizeSmall};
    border-radius: 2em;

    ${!isPhone && autoCollapse && !disabled
    ? collapsedOnRest('0px')
    : staticBox('0px')}
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

  @media (prefers-reduced-motion: reduce) {
    ${instantCollapse}
  }

  ${({ animations }) => animations === false && instantCollapse}
`;

const { VisuallyHidden } = VisuallyHiddenStyles;

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
