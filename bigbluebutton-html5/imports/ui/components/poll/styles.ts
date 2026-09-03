import styled, { css, keyframes } from 'styled-components';
import { BBBHint } from '@bigbluebutton/bbb-ui-components-react/Hint';
import { BBBTextInput } from '@bigbluebutton/bbb-ui-components-react/TextInput';
import PollTextArea from './components/PollTextArea';
import {
  Separator as BaseSeparator,
  PanelContent as BasePanelContent,
} from '/imports/ui/components/sidebar-content/styles';
import {
  jumboPaddingY,
  smPaddingX,
  smPaddingY,
  lgPaddingX,
  borderSize,
  pollInputHeight,
  pollSmMargin,
  mdPaddingX,
  pollStatsElementWidth,
  pollResultWidth,
  borderSizeLarge,
  smPadding,
  contentSidebarPadding,
  contentSidebarBottomScrollPadding,
  borderRadiusRounded,
  mdPaddingY,
  lgBorderRadius,
  borderSizeSmall,
  lgPadding,
  $2xlPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorText,
  colorBlueLight,
  colorBorder,
  colorGrayIcons,
  colorGrayUserListToolbar,
  colorGrayLighter,
  colorDanger,
  colorWarning,
  colorHeading,
  colorPrimary,
  colorGrayDark,
  colorWhite,
  pollStatsBorderColor,
  colorOffWhite,
  SegmentedButtonRingOffsetShadow,
  SegmentedButtonRingShadow,
  SegmentedButtonBoxShadowSm,
  slate900,
  darkCyanLime,
  colorInfoBoxQuizBg,
  colorInfoBoxQuizBorder,
  colorInfoBoxQuizText,
  colorSelectedCorrectAnswerText,
  colorSelectedCorrectAnswerBg,
  colorSelectedCorrectAnswerTextActive,
  colorSelectedCorrectAnswerBgActive,
  colorGreen600,
  colorGreen100,
  colorBlueLightest,
  colorBlueDark,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeBase,
  fontSizeSmall,
  fontSizeSmaller,
  lineHeightComputed,
  textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';

// Design spec for the text inside every poll button. The library's button hardcodes
// font-weight 600 and line-height normal, so both are restated wherever one is styled.
// font-family is deliberately left alone: the spec asks for Nunito Sans, which this app
// does not ship - it bundles Source Sans Pro only - so naming it here would just fall
// through to a fallback face and look worse than the app's own font.
const pollButtonText = css`
  font-size: ${fontSizeBase};
  font-weight: ${textFontWeight};
  line-height: 1;
  letter-spacing: 0;
`;

// The metrics every full-width poll button shares. BBButton drops `className`, so each
// call site wraps it in a styled element and reaches the button through `& > button`;
// this keeps the box itself defined once.
const pollButtonBox = css`
  justify-content: center;
  min-height: ${pollInputHeight};
  padding: ${lgPadding} ${$2xlPadding};
  border-radius: ${lgBorderRadius};
  white-space: pre-wrap;
  ${pollButtonText}
`;

const Separator = styled(BaseSeparator)``;

const PanelContent = styled(BasePanelContent)``;

type PollOptionInputProps = {
  $isCorrect?: boolean;
};

// The library's text input renders a MUI field, and the class lands on the field root,
// so the poll's own box - sizing, border and the quiz highlight - is applied to
// `.MuiInputBase-root`, which is the element that actually draws it.
const PollOptionInput = styled(BBBTextInput)<PollOptionInputProps>`
  // No explicit width: the library's wrapper is a column flex, so the field stretches to
  // it on its own - pinning it to 100% would make the margin below overflow instead.
  margin-right: 1rem;

  [dir="rtl"] & {
      margin-right: 0;
      margin-left: 1rem;
  }

  .MuiInputBase-root {
    min-height: ${pollInputHeight};
    color: ${colorText};
    padding: ${lgPadding} ${$2xlPadding};
    border-radius: ${lgBorderRadius};
    font-size: ${fontSizeBase};
    border: ${borderSizeSmall} solid ${colorBorder};

    &.Mui-focused {
      box-shadow: 0 0 0 ${borderSize} ${colorPrimary}, inset 0 0 0 ${borderSizeSmall} ${colorPrimary};
    }

    ${({ $isCorrect }) => $isCorrect && `
      background-color: rgb(240, 253, 244);
      border-color: rgb(134 239 172 / 1);
    `}
  }
`;
const DeletePollOptionButton = styled.div`
  display: flex;
  flex: none;
  margin-left: ${lgPadding};

  [dir="rtl"] & {
    margin-right: ${lgPadding};
    margin-left: 0;
  }

  & > button {
    width: ${pollInputHeight};
    min-height: ${pollInputHeight};
    border-radius: ${lgBorderRadius};
    font-size: ${fontSizeBase};
  }
`;

const ErrorSpacer = styled.div`
  position: relative;
  height: 1.25rem;
`;

const InputError = styled(ErrorSpacer)`
  color: ${colorDanger};
  font-size: ${fontSizeSmall};
`;

const Instructions = styled.div`
  margin-bottom: ${lgPaddingX};
  color: ${colorText};
`;

type PollQuestionAreaProps = {
  $hasError?: boolean;
};

// Wraps the library's textarea. The doubled selector (&&) is what makes these rules win:
// both sides are a single class on the same element, so specificity alone would tie and
// the result would depend on stylesheet order.
const PollQuestionArea = styled(PollTextArea)<PollQuestionAreaProps>`
  && {
    resize: none;
    width: 100%;
    margin: 0;
    color: ${colorText};
    -webkit-appearance: none;
    padding: ${$2xlPadding} ${jumboPaddingY};
    border-radius: ${lgBorderRadius};
    font-size: ${fontSizeBase};
    line-height: ${lineHeightComputed};
    border: ${borderSizeSmall} solid ${colorBorder};
    // The library caps its textarea and hides the overflow; the poll question holds up
    // to 1200 characters, so it has to be able to grow and then scroll.
    max-height: none;
    overflow-y: auto;

    &:focus {
      outline: none;
      box-shadow: 0 0 0 ${borderSize} ${colorPrimary}, inset 0 0 0 ${borderSizeSmall} ${colorPrimary};
    }

    ${({ $hasError }) => $hasError && `
      border-color: ${colorDanger};
      box-shadow: 0 0 0 ${borderSizeSmall} ${colorDanger};
    `}
  }
`;

const PollQuestionAreaWrapper = styled.div`
  margin-bottom: ${$2xlPadding};
`;

const SectionHeading = styled.h4`
  margin-top: 0;
  font-weight: 600;
  color: ${colorHeading};
  margin-bottom: ${lgPadding};
`;

const ResponseType = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${lgPadding};
  overflow-wrap: break-word;
  position: relative;
  width: 100%;
  margin-bottom: ${$2xlPadding};
`;

// One wrapper per response type, because the selected/unselected split cannot be
// expressed through the library's variants alone: its `tertiary` is a blue, borderless
// button and its `primary` fills with the client's lighter #0F70D7, while the spec asks
// for a grey box at rest and the darker brand blue once picked. Both states are painted
// here, so the variant underneath only decides the focus outline.
const ResponseTypeButton = styled.div<{ $selected: boolean }>`
  display: flex;
  width: 100%;

  & > button {
    position: relative;
    width: 100%;
    ${pollButtonBox}
  }

  /* !important is load-bearing in both states: the library states its hover as
     \`&&:hover:not(...)\`, which outranks any selector reachable from this wrapper.
     Without it the box would flip to the library's own colours on the way to being
     clicked; a toggle is meant to hold one fill through every interaction state.
     The library also paints the label span directly (\`& span { color: ... }\`), and a
     colour set on the span beats one inherited from the button, so the text needs its
     own rule or it keeps the variant's. */
  ${({ $selected }) => ($selected ? css`
    & > button {
      background-color: ${colorBlueDark} !important;
      border: ${borderSizeSmall} solid ${colorBlueDark} !important;
    }

    & > button,
    & > button span {
      color: ${colorWhite} !important;
    }
  ` : css`
    & > button {
      background-color: ${colorGrayUserListToolbar} !important;
      border: ${borderSizeSmall} solid ${colorGrayIcons} !important;
    }

    & > button,
    & > button span {
      color: ${colorGrayIcons} !important;
    }
  `)}
`;

const PollParagraph = styled.div`
  color: ${colorText};
  margin-bottom: 0.9rem;
`;

const PollCheckbox = styled.div`
  display: block;
  margin-bottom: ${$2xlPadding};
`;

const AddItemButton = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  & > button {
    gap: ${lgPadding};
    white-space: pre-wrap;
    text-decoration: underline;
    ${pollButtonText}
  }
`;

const Row = styled.div`
  display: flex;
  flex-flow: wrap;
  flex-grow: 1;
  justify-content: space-between;
  margin-top: 0.7rem;
  margin-bottom: 0.7rem;
`;

const Warning = styled.div`
  color: ${colorWarning};
  font-size: ${fontSizeSmall};
`;

const CustomInputRow = styled.div`
  display: flex;
  flex-flow: nowrap;
  flex-grow: 1;
  justify-content: space-between;
`;

const StartPollBtn = styled.div`
  display: flex;
  width: 100%;

  & > button {
    position: relative;
    width: 100%;
    overflow-wrap: break-word;
    ${pollButtonBox}
  }
`;

const PollFooter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 100%;
  padding: ${$2xlPadding} ${jumboPaddingY};
  border-top: ${borderSizeSmall} solid ${colorBorder};
  background-color: ${colorWhite};

  // The running-poll actions render nothing until their subscription resolves; without
  // this the footer would flash as an empty bordered bar.
  &:empty {
    display: none;
  }
`;

const CancelPollBtn = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${lgPadding};

  & > button {
    text-decoration: underline;
    ${pollButtonText}
  }
`;

const NoSlidePanelContainer = styled.div`
  color: ${colorGrayDark};
  text-align: center;
`;

const DragAndDropPollContainer = styled.div`
  width: 200px !important;
  height: 200px !important;
`;

const Question = styled.div`
  margin-bottom: ${lgPaddingX};
`;

const OptionWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ResponseArea = styled.div`
  display: flex;
  flex-flow: column wrap;
`;

const AnonymousRow = styled(Row)`
  flex-flow: nowrap;
  width: 100%;
  margin-bottom: ${$2xlPadding};
`;

const ResultLeft = styled.td`
  padding: 0 .5rem 0 0;
  border-bottom: 1px solid ${colorBorder};

  [dir="rtl"] & {
    padding: 0 0 0 .5rem;
  }
  padding-bottom: .25rem;
  word-break: break-all;
`;

const ResultRight = styled.td`
  padding-bottom: .25rem;
  padding-right: 0.5rem;
  word-break: break-all;
`;

const Main = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Left = styled.div`
  font-weight: bold;
  max-width: ${pollResultWidth};
  min-width: ${pollStatsElementWidth};
  word-wrap: break-word;
  flex: 6;

  padding: ${smPaddingY};
  margin-top: ${pollSmMargin};
  margin-bottom: ${pollSmMargin};
  color: ${colorText};

  position: relative;
`;

const Center = styled.div`
  position: relative;
  flex: 3;
  border-left: 1px solid ${colorBorder};
  border-right : none;
  width: 100%;
  height: 100%;

  [dir="rtl"] & {
    border-left: none;
    border-right: 1px solid ${colorBorder};
  }

  padding: ${smPaddingY};
  margin-top: ${pollSmMargin};
  margin-bottom: ${pollSmMargin};
  color: ${colorText};
`;

const Right = styled.div`
  text-align: right;
  max-width: ${pollStatsElementWidth};
  min-width: ${pollStatsElementWidth};
  flex: 1;

  [dir="rtl"] & {
    text-align: left;
  }

  padding: ${smPaddingY};
  margin-top: ${pollSmMargin};
  margin-bottom: ${pollSmMargin};
  color: ${colorText};

  position: relative;
`;

const BarShade = styled.div`
  background-color: ${colorGrayLighter};
  height: 100%;
  min-height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
`;

const BarVal = styled.div`
  position: inherit;
`;

const Stats = styled.div`
  margin-bottom: ${smPaddingX};
  display: flex;
  flex-direction: column;
  border: 1px solid ${pollStatsBorderColor};
  border-radius: ${borderSizeLarge};
  padding: ${mdPaddingX};

  & > div {
    display: flex;
    flex-direction: row;

    & > div:nth-child(even) {
      position: relative;
      height: 75%;
      width: 50%;
      text-align: center;
    }
  }
`;

const Title = styled.span`
  font-weight: bold;
  word-break: break-all;
  white-space: pre-wrap;
`;

const Status = styled.div`
  margin-bottom: .5rem;
`;

const ellipsis = keyframes`
  to {
    width: 1.25em;
    margin-right: 0;
    margin-left: 0;
  }
`;

interface ConnectingAnimationProps {
  animations: boolean;
}

const ConnectingAnimation = styled.span<ConnectingAnimationProps>`
  &:after {
    overflow: hidden;
    display: inline-block;
    vertical-align: bottom;
    content: "\\2026"; /* ascii code for the ellipsis character */
    width: 0;
    margin: 0 1.25em 0 0;

    [dir="rtl"] & {
      margin: 0 0 0 1.25em;
    }

    ${({ animations }) => animations && css`
      animation: ${ellipsis} steps(4, end) 900ms infinite;
    `}
  }
`;

const LiveResultActionsRow = styled.div`
  display: flex;
  gap: ${lgPadding};
  width: 100%;

  & > button {
    flex: 1 1 0;
    overflow-wrap: break-word;
    ${pollButtonBox}
  }
`;

const THeading = styled.th`
  text-align: left;

  [dir="rtl"] & {
    text-align: right;
  }
`;

// Layered on top of PollQuestionArea via its `as` prop, so it only adds the drop
// highlight; && for the same reason PollQuestionArea needs it.
const DndTextArea = styled(PollTextArea)<{ $active: boolean }>`
  && {
    background: ${({ $active }) => ($active ? colorGrayLighter : colorWhite)};
  }
`;

const ContentWrapper = styled(ScrollboxVertical)`
  // ScrollboxVertical paints scroll shadows as radial-gradients on its background. The
  // panel is meant to read flat, so they are dropped here rather than in the shared
  // component, which every other panel still relies on.
  background: none;
  margin: 0 ${smPadding} 0;
  padding: ${contentSidebarPadding} ${jumboPaddingY} ${contentSidebarBottomScrollPadding};
  flex: 1 1 auto;
  // Lets the box shrink below its content height so the footer stays pinned
  min-height: 0;
`;

const CorrectAnswerCheckbox = styled.input`
  width: 1.5rem;
  height: 1.5rem;
`;

const SegmentedButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: center;
  margin-bottom: ${mdPaddingX};
`;

const SegmentedButtonContainer = styled.div`
  display: flex;
  padding: 0.15rem;
  background-color: ${colorOffWhite};
  border-radius: ${borderRadiusRounded};
`;

interface TabSelectorButtonProps {
  active?: boolean;
}

const SegmentedButton = styled.button<TabSelectorButtonProps>`
  border: 0;
  background-color: transparent;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  color: rgb(75 85 99 / 1);
  font-weight: 500;
  font-size: ${fontSizeBase};
  line-height: ${lineHeightComputed};
  padding: ${mdPaddingY} ${mdPaddingX};
  min-height: 2.5rem;
  border-radius: .5rem;
  cursor: pointer;

  &:hover {
    color: rgb(17 24 39 / 1);
  }

  ${({ active }) => active && `
    box-shadow: var(${SegmentedButtonRingOffsetShadow}, 0 0 #0000),
                var(${SegmentedButtonRingShadow}, 0 0 #0000),
                var(${SegmentedButtonBoxShadowSm});
    color: ${slate900};
    background-color: ${colorWhite};
  `}


`;

const ShowCorrectAnswerLabel = styled.label`
  font-size: ${fontSizeSmall};
  font-weight: bolder;
  display: flex;
  align-items: center;
  font-size: ${fontSizeSmall};
  margin-bottom: 1rem;

  & > * {
    margin: 0 .5rem 0 0;

    [dir="rtl"] & {
      margin: 0 0 0 .5rem;
    }
  }
`;

const LiveResultTable = styled.table`
  width: 100%;
`;

const QuizCorrectAnswerCheckbox = styled.input`  
  --accent: ${darkCyanLime};
  --inputMask: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="3" stroke="%23000" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path d="M5 12l5 5l10 -10"/></svg>');
  
  appearance: none;
  aspect-ratio: 1;
  background: var(--backgroundColor, Field);
  border: 1px solid var(--borderColor, ${colorBorder});
  border-radius: 50%;
  box-sizing: border-box;
  font-size: 1em;
  height: ${lgPaddingX};
  margin: .1875em .1875em .1875em .25em;
  position: relative;
  width: ${lgPaddingX};
  margin-right: ${mdPaddingX};

  &::after {
    background: var(--backgroundColorAfter, transparent);
    content: "";
    inset: 0;
    position: absolute;
    mask: var(--inputMask) no-repeat center / contain;
    -webkit-mask: var(--inputMask) no-repeat center / contain;
  }

  &:checked {
    --backgroundColor: var(--accent);
    --backgroundColorAfter: Field;
  }

  @media (hover: hover) {
    &:checked:hover {
      --backgroundColor: color-mix(in srgb, var(--accent) 60%, CanvasText 40%);
    }
    &:not(:checked):hover {
      --borderColor: color-mix(in srgb, GrayText 60%, CanvasText 40%);
    }
  }
`;

type InfoBoxContainerProps = {
  isQuiz: boolean;
};

const InfoBoxContainer = styled.div<InfoBoxContainerProps>`
  padding: .5rem ${mdPaddingX};
  border-radius: .5rem;
  margin-bottom: 1rem;

  color: ${colorBlueLight};
  background-color: ${colorBlueLightest};
  border: 1px solid ${colorPrimary};

  ${({ isQuiz }) => isQuiz && `
    background-color: ${colorInfoBoxQuizBg};
    border: 1px solid ${colorInfoBoxQuizBorder};
    color: ${colorInfoBoxQuizText};
  `}
`;

const TypedResponseHint = styled(BBBHint)`
  margin-bottom: ${$2xlPadding};
`;

const ResponseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

type SelectedCorrectAnswerIndicatorProps = {
  hasCorrectAnswer: boolean;
};

const SelectedCorrectAnswerIndicator = styled.span<SelectedCorrectAnswerIndicatorProps>`
  color: ${colorSelectedCorrectAnswerText};
  line-height: 1.25rem;
  padding: 0.25rem 0.50rem;
  background-color: ${colorSelectedCorrectAnswerBg};
  border-radius: 9999px;

  ${({ hasCorrectAnswer }) => hasCorrectAnswer && `
    color: ${colorSelectedCorrectAnswerTextActive};
    background-color: ${colorSelectedCorrectAnswerBgActive};
  `}
`;

const CorrectLabel = styled.div`
  position: absolute;
  top: 50%;
  right: 2rem;
  transform:  translate(0, -50%);
  border-radius: 9999px; 
  color: ${colorGreen600};
  background-color: ${colorGreen100};
  padding: 0.25rem 0.50rem;
  font-size: ${fontSizeSmaller};
  line-height: ${lineHeightComputed};
`;

const PollInputContainer = styled.div`
  display: flex;
  flex: 1 1 0%;
  position: relative;
`;

export default {
  Separator,
  PanelContent,
  PollOptionInput,
  DeletePollOptionButton,
  ErrorSpacer,
  InputError,
  Instructions,
  PollQuestionArea,
  SectionHeading,
  ResponseType,
  ResponseTypeButton,
  PollParagraph,
  PollCheckbox,
  AddItemButton,
  Row,
  StartPollBtn,
  PollFooter,
  CancelPollBtn,
  LiveResultActionsRow,
  NoSlidePanelContainer,
  DragAndDropPollContainer,
  Warning,
  CustomInputRow,
  Question,
  OptionWrapper,
  ResponseArea,
  AnonymousRow,
  ResultLeft,
  ResultRight,
  Main,
  Left,
  Center,
  Right,
  BarShade,
  BarVal,
  Stats,
  Title,
  Status,
  ConnectingAnimation,
  THeading,
  DndTextArea,
  ContentWrapper,
  CorrectAnswerCheckbox,
  SegmentedButtonContainer,
  ShowCorrectAnswerLabel,
  LiveResultTable,
  SegmentedButtonWrapper,
  SegmentedButton,
  QuizCorrectAnswerCheckbox,
  InfoBoxContainer,
  ResponseHeader,
  TypedResponseHint,
  SelectedCorrectAnswerIndicator,
  CorrectLabel,
  PollInputContainer,
  PollQuestionAreaWrapper,
};
