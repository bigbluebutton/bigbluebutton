import styled from 'styled-components';
import {
  mdPaddingY,
  smPaddingY,
  jumboPaddingY,
  smPaddingX,
  borderRadius,
  pollWidth,
  pollSmMargin,
  overlayIndex,
  overlayOpacity,
  pollIndex,
  lgPaddingY,
  pollBottomOffset,
  jumboPaddingX,
  pollColAmount,
  borderSize,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeSmall,
  fontSizeBase,
  fontSizeLarge,
} from '/imports/ui/stylesheets/styled-components/typography';
import {
  colorText,
  colorBlueLight,
  colorGrayLighter,
  colorOffWhite,
  colorGrayDark,
  colorWhite,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';
import { hasPhoneDimentions } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Button from '/imports/ui/components/common/button/component';

const PollingTitle = styled.div`
  white-space: nowrap;
  padding-bottom: ${mdPaddingY};
  padding-top: ${mdPaddingY};
  font-size: ${fontSizeSmall};
`;

const PollButtonWrapper = styled.div`
  text-align: center;
  padding: ${smPaddingY};
  width: 100%;
`;

const PollingButton = styled(Button)`
  width: 100%;
  max-width: 9em;

  @media ${hasPhoneDimentions} {
    max-width: none;
  }
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Hidden = styled.div`
  display: none;
`;

const TypedResponseWrapper = styled.div`
  margin: ${jumboPaddingY} .5rem .5rem .5rem;
  display: flex;
  flex-flow: column;
`;

const TypedResponseInput = styled.input`
  &:focus {
    outline: none;
    border-radius: ${borderSize};
    box-shadow: 0 0 0 ${borderSize} ${colorBlueLight}, inset 0 0 0 1px ${colorPrimary};
  }

  color: ${colorText};
  -webkit-appearance: none;
  padding: calc(${smPaddingY} * 2.5) calc(${smPaddingX} * 1.25);
  border-radius: ${borderRadius};
  font-size: ${fontSizeBase};
  border: 1px solid ${colorGrayLighter};
  box-shadow: 0 0 0 1px ${colorGrayLighter};
  margin-bottom: 1rem;
`;

const SubmitVoteButton = styled(Button)`
  font-size: ${fontSizeBase};
`;

const PollingSecret = styled.div`
  font-size: ${fontSizeSmall};
  max-width: ${pollWidth};
`;

const MultipleResponseAnswersTable = styled.table`
  margin-left: auto;
  margin-right: auto;
`;

const PollingCheckbox = styled.div`
  display: inline-block;
  margin-right: ${pollSmMargin};
`;

const CheckboxContainer = styled.tr`
  margin-bottom: ${pollSmMargin};
`;

const MultipleResponseAnswersTableAnswerText = styled.td`
  text-align: left;
`;

const Overlay = styled.div`
  position: absolute;
  height: 100vh;
  width: 100vw;
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

const QTitle = styled.div`
  font-size: ${fontSizeSmall};
`;

const QText = styled.div`
  color: ${colorText};
  word-break: break-word;
  white-space: pre-wrap;
  font-size: ${fontSizeLarge};
  max-width: ${pollWidth};
  padding-right: ${smPaddingX};
`;

const PollingContainer = styled.div`
  pointer-events:auto;
  min-width: ${pollWidth};
  position: absolute;

  z-index: ${pollIndex};
  border: 1px solid ${colorOffWhite};
  border-radius: ${borderRadius};
  box-shadow: ${colorGrayDark} 0px 0px ${lgPaddingY};
  align-items: center;
  text-align: center;
  font-weight: 600;
  padding: ${mdPaddingY};
  background-color: ${colorWhite};
  bottom: ${pollBottomOffset};
  right: ${jumboPaddingX};

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

  ${({ autoWidth }) => autoWidth && `
    width: auto;
  `}
`;

const PollingAnswers = styled.div`
  display: grid;
  grid-template-columns: repeat(${pollColAmount}, 1fr);

  @media ${hasPhoneDimentions} {
    grid-template-columns: repeat(1, 1fr);

    & div button {
      grid-column: 1;
    }
  }

  z-index: 1;

  ${({ removeColumns }) => removeColumns && `
    grid-template-columns: auto;
  `}

  ${({ stacked }) => stacked && `
    grid-template-columns: repeat(1, 1fr);

    & div button {
      max-width: none !important;
    }
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
  MultipleResponseAnswersTable,
  PollingCheckbox,
  CheckboxContainer,
  MultipleResponseAnswersTableAnswerText,
  Overlay,
  QHeader,
  QTitle,
  QText,
  PollingContainer,
  PollingAnswers,
};
