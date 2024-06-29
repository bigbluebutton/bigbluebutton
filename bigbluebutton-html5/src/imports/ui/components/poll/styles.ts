import styled, { css, keyframes } from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import {
  jumboPaddingY,
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
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeBase, fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';

const ToggleLabel = styled.span`
  margin-right: ${smPaddingX};

  [dir="rtl"] & {
    margin: 0 0 0 ${smPaddingX};
  }
`;

const PollOptionInput = styled.input`
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

const SectionHeading = styled.h4`
  margin-top: 0;
  font-weight: 600;
  color: ${colorHeading};
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
`;

const ResponseArea = styled.div`
  display: flex;
  flex-flow: column wrap;
`;

const CustomInputHeading = styled(SectionHeading)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding-bottom: ${jumboPaddingY};
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
};
