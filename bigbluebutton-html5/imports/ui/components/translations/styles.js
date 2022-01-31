import styled from 'styled-components';
import Button from '/imports/ui/components/button/component';
import { colorWhite, colorGrayDark } from '/imports/ui/stylesheets/styled-components/palette';
import {
  mdPaddingX,
  mdPaddingY,
  pollHeaderOffset,
  borderSize,
  borderSizeLarge,
  toastContentWidth,
} from '/imports/ui/stylesheets/styled-components/general';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const AddLanguage = styled.span`
  font-family: Source Sans Pro;
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 15px;
  cursor: pointer;
  color: #6096D6;
`;

const TranslationPanel = styled.div`
  background-color: ${colorWhite};
  padding: ${mdPaddingX} ${mdPaddingY} ${mdPaddingX} ${mdPaddingX};
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  ${({ isChrome }) => isChrome && `
    transform: translateZ(0);
  `}
  @media ${smallOnly} {
    transform: none !important;
  }
`;

const Header = styled.header`
  position: relative;
  top: ${pollHeaderOffset};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.div`
  min-width: 0;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  & > button, button:hover {
    max-width: ${toastContentWidth};
  }
`;

const HideButton = styled(Button)`
  position: relative;
  background-color: ${colorWhite};
  display: block;
  margin: ${borderSizeLarge};
  margin-bottom: ${borderSize};
  padding-left: 0;
  padding-right: inherit;
  [dir="rtl"] & {
    padding-left: inherit;
    padding-right: 0;
  }
  & > i {
    color: ${colorGrayDark};
    font-size: smaller;
    [dir="rtl"] & {
      -webkit-transform: scale(-1, 1);
      -moz-transform: scale(-1, 1);
      -ms-transform: scale(-1, 1);
      -o-transform: scale(-1, 1);
      transform: scale(-1, 1);
    }
  }
  &:hover {
    background-color: ${colorWhite};
  }
`;

const SpeechDetectionThresholdWrapper = styled.div`
  max-width: 270px;
`;

const SpeechDetectionThresholdExplanation = styled.div`
  margin: 5px 0 0 0;
  font-size: .8em;
  text-align: justify;
`;

export default {
  AddLanguage,
  TranslationPanel,
  Header,
  Title,
  HideButton,
  SpeechDetectionThresholdWrapper,
  SpeechDetectionThresholdExplanation,
};
