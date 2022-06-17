import styled from 'styled-components';
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
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorText,
  colorBlueLight,
  colorGray,
  colorGrayLight,
  colorGrayLighter,
  colorGrayLightest,
  colorDanger,
  colorHeading,
  colorPrimary,
  colorGrayDark,
  colorWhite,
  pollBlue,
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

const PollQuestionArea = styled.textarea`
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
`;

const PollCheckbox = styled.div`
  display: inline-block;
  margin-right: ${pollSmMargin};
  margin-bottom: ${pollMdMargin};
`;

const InstructionsLabel = styled.label`
  margin-bottom: ${lgPaddingX};
  color: ${colorText};
`;

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

const PollButton = styled(Button)`
  margin-top: ${smPaddingY};
  margin-bottom: ${smPaddingY};
  background-color: ${colorWhite};
  box-shadow: 0 0 0 1px ${colorGray};
  color: ${colorGray};

  & > span {
    color: ${colorGray};
  }

  & > span:hover {
    color: ${pollBlue};
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
    box-shadow: 0 0 0 1px ${pollBlue};
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
  InstructionsLabel,
  AddItemButton,
  Row,
  Col,
  Toggle,
  StartPollBtn,
  NoSlidePanelContainer,
  PollButton,
  DragAndDropPollContainer,
};
