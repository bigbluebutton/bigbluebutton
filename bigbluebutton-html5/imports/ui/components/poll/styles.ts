import styled, { css, keyframes } from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import {
  smPaddingX,
  smPaddingY,
  lgPaddingX,
  borderRadius,
  borderSize,
  pollInputHeight,
  pollSmMargin,
  pollMdMargin,
  mdPaddingX,
  pollStatsElementWidth,
  pollResultWidth,
  borderSizeLarge,
  borderRadiusRounded,
  mdPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorText,
  colorBlueLight,
  colorGray,
  colorGrayLight,
  colorGrayLighter,
  colorGrayLightest,
  colorDanger,
  colorWarning,
  colorHeading,
  colorPrimary,
  colorGrayDark,
  colorWhite,
  pollBlue,
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
  colorBlueLighter,
  colorBlueLightest,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeBase,
  fontSizeSmall,
  fontSizeSmaller,
  lineHeightComputed,
} from '/imports/ui/stylesheets/styled-components/typography';

const ToggleLabel = styled.span`
  margin-right: ${smPaddingX};

  [dir="rtl"] & {
    margin: 0 0 0 ${smPaddingX};
  }
`;

type PollOptionInputProps = {
  isCorrect?: boolean;
};

const PollOptionInput = styled.input<PollOptionInputProps>`
  margin-right: 1rem;

  [dir="rtl"] & {
      margin-right: 0;
      margin-left: 1rem;
  }

  &:focus {
    outline: none;
    border-radius: ${borderSize};
    box-shadow: 0 0 0 ${borderSize} ${colorBlueLight}, inset 0 0 0 1px ${colorPrimary};
  }

  width: 100%;
  color: ${colorText};
  -webkit-appearance: none;
  padding: calc(${smPaddingY} * 2) ${smPaddingX};
  border-radius: ${borderRadius};
  font-size: ${fontSizeBase};
  border: 1px solid ${colorGrayLighter};
  box-shadow: 0 0 0 1px ${colorGrayLighter};

  ${({ isCorrect }) => isCorrect && ` 
    background-color: rgb(240, 253, 244);
    border-color: rgb(134 239 172 / 1);
  `}
`;
// @ts-ignore - Button is a JS Component
const DeletePollOptionButton = styled(Button)`
  font-size: ${fontSizeBase};
  flex: none;
  width: 40px;
  position: relative;
  & > i {
    font-size: 150%;
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
  hasError: boolean;
};

const PollQuestionArea = styled.textarea<PollQuestionAreaProps>`
  resize: none;

  &:focus {
    outline: none;
    border-radius: ${borderSize};
    box-shadow: 0 0 0 ${borderSize} ${colorBlueLight}, inset 0 0 0 1px ${colorPrimary};
  }

  width: 100%;
  color: ${colorText};
  -webkit-appearance: none;
  padding: calc(${smPaddingY} * 2) ${smPaddingX};
  border-radius: ${borderRadius};
  font-size: ${fontSizeBase};
  border: 1px solid ${colorGrayLighter};
  box-shadow: 0 0 0 1px ${colorGrayLighter};

  ${({ hasError }) => hasError && `
    border-color: ${colorDanger};
    box-shadow: 0 0 0 1px ${colorDanger};
  `}
`;

const PollQuestionAreaWrapper = styled.div`
  margin-bottom: ${lgPaddingX};
`;

const SectionHeading = styled.h4`
  margin-top: 0;
  font-weight: 600;
  color: ${colorHeading};
  margin-bottom: .25rem; 
`;

const ResponseType = styled.div`
  display: flex;
  justify-content: space-between;
  flex-flow: wrap;
  overflow-wrap: break-word;
  position: relative;
  width: 100%;
  margin-bottom: ${lgPaddingX};

  & > button {
    position: relative;
    width: 100%;
  }
`;

// @ts-ignore - Button is a JS Component
const PollConfigButton = styled(Button)`
  border: solid ${colorGrayLight} 1px;
  min-height: ${pollInputHeight};
  font-size: ${fontSizeBase};
  white-space: pre-wrap;
  width: 100%;
  margin-bottom: 1rem;

  & > span {
    &:hover {
      opacity: 1;
    }
  }

  ${({ selected }) => selected && `
    background-color: ${colorGrayLightest};
    font-size: ${fontSizeBase};

    &:hover,
    &:focus,
    &:active {
      background-color: ${colorGrayLightest} !important;
      box-shadow: none !important;
    }
  `}

  ${({ small }) => small && `
    width: 49% !important;
  `}

  ${({ full }) => full && `
    width: 100%;
  `}
`;

const PollParagraph = styled.div`
  color: ${colorText};
  margin-bottom: 0.9rem;
`;

const PollCheckbox = styled.div`
  display: inline-block;
  margin-right: ${pollSmMargin};
  margin-bottom: ${pollMdMargin};
`;

// @ts-ignore - Button is a JS Component
const AddItemButton = styled(Button)`
  top: 1px;
  position: relative;
  display: block;
  width: 100%;
  text-align: left;
  color: ${colorPrimary};
  padding-left: 0;
  padding-right: 0;
  font-size: ${fontSizeBase};
  white-space: pre-wrap;

  &:hover {
    & > span {
      opacity: 1;
    }
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

const Col = styled.div`
  display: flex;
  position: relative;
  flex-flow: column;
  flex-grow: 1;
  
  &:last-child {
    padding-right: 0;
    padding-left: 1rem;

    [dir="rtl"] & {
      padding-right: 0.1rem;
      padding-left: 0;
    }
  }
`;

const Toggle = styled.label`
  margin-left: auto;
  display: flex;
  align-items: center;
`;

// @ts-ignore - Button is a JS Component
const StartPollBtn = styled(Button)`
  position: relative;
  width: 100%;
  min-height: ${pollInputHeight};
  margin-top: 1rem;
  font-size: ${fontSizeBase};
  overflow-wrap: break-word;
  white-space: pre-wrap;

  &:hover {
    & > span {
      opacity: 1;
    }
  }
`;

const NoSlidePanelContainer = styled.div`
  color: ${colorGrayDark};
  text-align: center;
`;

// @ts-ignore - Button is a JS Component
const PollButton = styled(Button)`
  margin-top: ${smPaddingY};
  margin-bottom: ${smPaddingY};
  // background-color: ${colorWhite};
  box-shadow: 0 0 0 1px ${colorPrimary};
  color: ${colorWhite};
  background-color: ${colorPrimary}

  & > span {
    color: ${colorGray};
  }

  & > span:hover {
    color: ${colorWhite};
    opacity: 1;
  }

  &:active {
    background-color: ${colorWhite};
    box-shadow: 0 0 0 1px ${pollBlue};

    & > span {
      color: ${pollBlue};
    }
  }

  &:focus {
    background-color: ${colorWhite};
    box-shadow: 0 0 0 1px ${pollBlue};

    & > span {
      color: ${pollBlue};
    }
  }

  &:nth-child(even) {
    margin-right: inherit;
    margin-left: ${smPaddingY};

    [dir="rtl"] & {
      margin-right: ${smPaddingY};
      margin-left: inherit;
    }
  }

  &:nth-child(odd) {
    margin-right: 1rem;
    margin-left: inherit;

    [dir="rtl"] & {
      margin-right: inherit;
      margin-left: ${smPaddingY};
    }
  }

  &:hover {
    box-shadow: 0 0 0 1px ${colorWhite};
    background-color: ${colorWhite};
    color: ${pollBlue};

    & > span {
      color: ${pollBlue};
      opacity: 1;
    }
  }
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

const CustomInputHeading = styled(SectionHeading)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding-bottom: ${mdPaddingX};
`;

const CustomInputHeadingCol = styled(Col)`
  overflow: hidden;
`;

const CustomInputToggleCol = styled(Col)`
  flex-shrink: 0;
`;

const AnonymousHeading = styled(CustomInputHeading)``;

const AnonymousHeadingCol = styled(CustomInputHeadingCol)``;

const AnonymousToggleCol = styled(CustomInputToggleCol)``;

const AnonymousRow = styled(Row)`
  flex-flow: nowrap;
  width: 100%;
`;

const ResultLeft = styled.td`
  padding: 0 .5rem 0 0;
  border-bottom: 1px solid ${colorGrayLightest};

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
  border-left: 1px solid ${colorGrayLighter};
  border-right : none;
  width: 100%;
  height: 100%;

  [dir="rtl"] & {
    border-left: none;
    border-right: 1px solid ${colorGrayLighter};
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

const ButtonsActions = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

// @ts-ignore - Button is a JS Component
const PublishButton = styled(Button)`
  width: 48%;
  overflow-wrap: break-word;
  white-space: pre-wrap;
`;

const CancelButton = styled(PublishButton)``;

// @ts-ignore - Button is a JS Component
const LiveResultButton = styled(Button)`
  width: 100%;
  margin-top: ${smPaddingY};
  margin-bottom: ${smPaddingY};
  font-size: ${fontSizeBase};
  overflow-wrap: break-word;
  white-space: pre-wrap;
`;

const Separator = styled.div`
  display: flex;
  flex: 1 1 100%;
  height: 1px;
  min-height: 1px;
  background-color: ${colorGrayLightest};
  padding: 0;
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

const THeading = styled.th`
  text-align: left;

  [dir="rtl"] & {
    text-align: right;
  }
`;

const DndTextArea = styled.textarea<{ active: boolean }>`
  ${({ active }) => active && `
    background: ${colorGrayLighter};
  `}

  ${({ active }) => !active && `
    background: ${colorWhite};
  `}
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
  border: 1px solid var(--borderColor, ${colorGrayLight});
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
  border: 1px solid ${colorBlueLighter};

  ${({ isQuiz }) => isQuiz && `
    background-color: ${colorInfoBoxQuizBg};
    border: 1px solid ${colorInfoBoxQuizBorder};
    color: ${colorInfoBoxQuizText};
  `}
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
  ToggleLabel,
  PollOptionInput,
  DeletePollOptionButton,
  ErrorSpacer,
  InputError,
  Instructions,
  PollQuestionArea,
  SectionHeading,
  ResponseType,
  PollConfigButton,
  PollParagraph,
  PollCheckbox,
  AddItemButton,
  Row,
  Col,
  Toggle,
  StartPollBtn,
  NoSlidePanelContainer,
  PollButton,
  DragAndDropPollContainer,
  Warning,
  CustomInputRow,
  Question,
  OptionWrapper,
  ResponseArea,
  CustomInputHeading,
  CustomInputHeadingCol,
  CustomInputToggleCol,
  AnonymousHeading,
  AnonymousHeadingCol,
  AnonymousToggleCol,
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
  ButtonsActions,
  PublishButton,
  CancelButton,
  LiveResultButton,
  Separator,
  THeading,
  DndTextArea,
  CorrectAnswerCheckbox,
  SegmentedButtonContainer,
  ShowCorrectAnswerLabel,
  LiveResultTable,
  SegmentedButtonWrapper,
  SegmentedButton,
  QuizCorrectAnswerCheckbox,
  InfoBoxContainer,
  ResponseHeader,
  SelectedCorrectAnswerIndicator,
  CorrectLabel,
  PollInputContainer,
  PollQuestionAreaWrapper,
};
