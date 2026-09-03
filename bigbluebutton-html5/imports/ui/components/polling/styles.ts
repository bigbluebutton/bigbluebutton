import styled, { css } from 'styled-components';
import {
  mdPaddingY,
  smPaddingY,
  jumboPaddingY,
  smPaddingX,
  borderRadius,
  borderSize,
  pollWidth,
  overlayIndex,
  overlayOpacity,
  pollIndex,
  pollBottomOffset,
  jumboPaddingX,
  pollColAmount,
  borderSizeSmall,
  pollInputHeight,
  lgBorderRadius,
  lgPadding,
  $2xlPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeSmall,
  fontSizeBase,
  fontSizeLarge,
  textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';
import {
  colorText,
  colorBorder,
  colorWhite,
  colorPrimary,
  colorBlueDark,
  colorGrayIcons,
  colorGrayUserListToolbar,
} from '/imports/ui/stylesheets/styled-components/palette';
import { hasPhoneDimentions } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Button from '/imports/ui/components/common/button/component';

const PollingTitle = styled.h1`
  white-space: nowrap;
  padding-bottom: ${mdPaddingY};
  padding-top: ${mdPaddingY};
  font-size: ${fontSizeSmall};
  margin: 0;
  padding: 0;
  font-weight: 600;
`;

// The option box both answer modes share. A single-response option votes on click and a
// multiple-response one toggles, but to the eye they are the same control, so height,
// radius and resting greys live here instead of being restated per mode.
const pollOptionBox = css`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: ${pollInputHeight};
  padding: ${lgPadding} ${$2xlPadding};
  border-radius: ${lgBorderRadius};
  cursor: pointer;
  overflow-wrap: anywhere;
  font-size: ${fontSizeBase};
  font-weight: ${textFontWeight};
  line-height: 1;

  background-color: ${colorGrayUserListToolbar};
  color: ${colorGrayIcons};
  border: ${borderSizeSmall} solid ${colorGrayIcons};
`;

// The brand fill that marks the active option: a ticked checkbox in a multiple-response
// poll, the hovered/focused option in a single-response one.
const pollOptionBoxActive = css`
  background-color: ${colorBlueDark};
  color: ${colorWhite};
  border-color: ${colorBlueDark};
`;

const PollButtonWrapper = styled.div`
  width: 100%;
`;

// A plain button rather than the common one: that component caps itself at 9em and paints
// a solid brand pill, which is the pre-redesign look and left single-response polls
// looking nothing like multiple-response ones.
const PollingButton = styled.button`
  ${pollOptionBox}
  justify-content: center;
  text-align: center;
  font-family: inherit;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  &:hover,
  &:focus-visible {
    ${pollOptionBoxActive}
  }

  &:focus-visible {
    outline: ${borderSize} solid ${colorPrimary};
    outline-offset: ${borderSizeSmall};
  }
`;

const Hidden = styled.div`
  display: none;
`;

const TypedResponseWrapper = styled.div`
  margin: ${jumboPaddingY} 0.5rem 0.5rem 0.5rem;
  display: flex;
  flex-flow: column;
`;

const TypedResponseInput = styled.input`
  &:focus {
    outline: none;
    border-radius: ${borderSize};
    box-shadow: 0 0 0 ${borderSize} ${colorPrimary},
      inset 0 0 0 1px ${colorPrimary};
  }

  color: ${colorText};
  -webkit-appearance: none;
  padding: calc(${smPaddingY} * 2.5) calc(${smPaddingX} * 1.25);
  border-radius: ${borderRadius};
  font-size: ${fontSizeBase};
  border: 1px solid ${colorBorder};
  box-shadow: 0 0 0 1px ${colorBorder};
  margin-bottom: 1rem;
`;

// @ts-ignore Until everything in Typescript
const SubmitVoteButton = styled(Button)`
  font-size: ${fontSizeBase};
`;

const PollingSecret = styled.div`
  font-size: ${fontSizeSmall};
  max-width: ${pollWidth};
`;

// Tells a multiple-response poll apart from a single-response one at a glance: without a
// box to tick, both render as a row of rounded option boxes and nothing says more than one
// answer is allowed. Sits left of the label and is decorative - the real checkbox below
// carries the semantics - so it is aria-hidden at the call site.
const MultipleChoiceIndicator = styled.span`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: ${borderSize} solid currentColor;
  border-radius: ${borderRadius};
  box-sizing: border-box;

  /* The tick: two borders of an empty box, rotated into a check. Hidden rather than
     unmounted so ticking an option doesn't reflow the row. */
  &::after {
    content: '';
    width: 0.3rem;
    height: 0.55rem;
    margin-bottom: 0.15rem;
    border: solid transparent;
    border-width: 0 ${borderSize} ${borderSize} 0;
    transform: rotate(45deg);
  }
`;

// A one-line reminder that more than one answer may be picked. The container centres its
// text and sets font-weight 600 for the question; this is help text, so it opts out of
// both to read as a caption rather than a second heading.
const MultipleChoiceHint = styled.div`
  margin-bottom: ${lgPadding};
  text-align: left;
  font-size: ${fontSizeSmall};
  font-weight: ${textFontWeight};
  color: ${colorText};
`;

// Multiple-response options are laid out two per row - a b / c d - and styled as toggle
// boxes matching the creation panel: grey at rest, brand fill once picked. An odd option
// count simply leaves the last one alone on its row.
const MultipleChoiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${lgPadding};
  width: 100%;
  margin-bottom: ${jumboPaddingY};
`;

const MultipleChoiceLabel = styled.label<{ $checked: boolean }>`
  ${pollOptionBox}
  justify-content: flex-start;
  gap: ${lgPadding};
  text-align: left;

  ${({ $checked }) => $checked && css`
    ${pollOptionBoxActive}

    /* Filled box with a blue tick, so the picked state still reads as a ticked checkbox
       once the option itself is blue. */
    ${MultipleChoiceIndicator} {
      background-color: ${colorWhite};
      border-color: ${colorWhite};

      &::after {
        border-color: ${colorBlueDark};
      }
    }
  `}
`;

const MultipleChoiceOption = styled.div`
  position: relative;
  display: flex;
`;

// A real checkbox, laid over the whole box rather than hidden: the checked state stays
// announced natively and keyboard operation is unchanged, while a click anywhere on the
// option toggles it. Opacity rather than display/visibility so it stays hit-testable.
const MultipleChoiceInput = styled.input`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;

  &:focus-visible + ${MultipleChoiceLabel} {
    outline: ${borderSize} solid ${colorPrimary};
    outline-offset: ${borderSizeSmall};
  }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: ${overlayIndex};
  pointer-events: none;

  @media ${hasPhoneDimentions} {
    pointer-events: auto;
    background-color: rgba(0, 0, 0, ${overlayOpacity});
  }
`;

const QHeader = styled.span`
  text-align: left;
  position: relative;
  left: ${smPaddingY};
`;

const QTitle = styled.h1`
  font-size: ${fontSizeSmall};
  margin: 0;
  padding: 0;
  font-weight: 600;
`;

const QText = styled.div`
  color: ${colorText};
  word-break: break-word;
  white-space: pre-wrap;
  font-size: ${fontSizeLarge};
  max-width: ${pollWidth};
  padding-right: ${smPaddingX};
`;

const PollingContainer = styled.aside<{ autoWidth: boolean }>`
  pointer-events: auto;
  min-width: ${pollWidth};
  position: absolute;

  z-index: ${pollIndex};
  border: 1px solid ${colorBorder};
  border-radius: ${borderRadius};
  align-items: center;
  text-align: center;
  font-weight: 600;
  padding: ${mdPaddingY};
  background-color: ${colorWhite};
  bottom: ${pollBottomOffset};
  right: ${jumboPaddingX};

  &:focus {
    border: 1px solid ${colorPrimary};
  }

  [dir="rtl"] & {
    left: ${jumboPaddingX};
    right: auto;
  }

  @media ${hasPhoneDimentions} {
    bottom: auto;
    right: auto;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: 95%;
    overflow-y: auto;

    [dir="rtl"] & {
      left: 50%;
    }
  }

  ${({ autoWidth }) => autoWidth
    && `
    width: auto;
  `}
`;

const PollingAnswers = styled.div<{ removeColumns: boolean; stacked: boolean }>`
  display: grid;
  grid-template-columns: repeat(${pollColAmount}, 1fr);
  gap: ${lgPadding};
  width: 100%;

  @media ${hasPhoneDimentions} {
    grid-template-columns: repeat(1, 1fr);
  }

  z-index: 1;

  ${({ removeColumns }) => removeColumns
    && `
    grid-template-columns: auto;
  `}

  ${({ stacked }) => stacked
    && `
    grid-template-columns: repeat(1, 1fr);
  `}
`;

export default {
  PollingTitle,
  PollButtonWrapper,
  PollingButton,
  Hidden,
  TypedResponseWrapper,
  TypedResponseInput,
  SubmitVoteButton,
  PollingSecret,
  MultipleChoiceGrid,
  MultipleChoiceHint,
  MultipleChoiceIndicator,
  MultipleChoiceOption,
  MultipleChoiceInput,
  MultipleChoiceLabel,
  Overlay,
  QHeader,
  QTitle,
  QText,
  PollingContainer,
  PollingAnswers,
};
