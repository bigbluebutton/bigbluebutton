import styled, { css, keyframes } from 'styled-components';
import {
  borderSize,
  borderSizeLarge,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorGrayLabel,
  colorWhite,
  colorGrayLighter,
  colorGrayDark,
  colorPrimary,
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeLarge,
  lineHeightComputed,
  headingsFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';
import { smallOnly, landscape } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Modal from '/imports/ui/components/common/modal/simple/component';
import ModalStyles from '/imports/ui/components/common/modal/simple/styles';

const Warning = styled.div`
  text-align: center;
  font-weight: ${headingsFontWeight};
  font-size: 5rem;
  white-space: normal;
`;

const Main = styled.h4`
  margin: ${lineHeightComputed};
  text-align: center;
  font-size: ${fontSizeLarge};
`;

const Text = styled.div`
  margin: ${lineHeightComputed};
  text-align: center;
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  margin: 0 0.5rem 0 0.5rem;

  width: 50%;
  @media ${smallOnly} {
    width: 90%;
    height: unset;
  }
`;

const VideoCol = styled(Col)`
  align-items: center;

  @media ${landscape} {
     width: 33.3%;
   }
`;

const Label = styled.label`
  margin-top: 8px;
  font-size: 0.85rem;
  font-weight: bold;
  color: ${colorGrayLabel};
`;

const Select = styled.select`
  background-color: ${colorWhite};
  border: ${borderSize} solid ${colorWhite};
  border-radius: ${borderSize};
  border-bottom: 0.1rem solid ${colorGrayLighter};
  color: ${colorGrayLabel};
  width: 100%;
  height: 1.75rem;
  padding: 1px;

  &:focus {
    outline: none;
    border-radius: ${borderSize};
    box-shadow: 0 0 0 ${borderSize} ${colorPrimary}, inset 0 0 0 1px ${colorPrimary};
  }

  &:hover,
  &:focus {
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
  }
`;

const Content = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  color: ${colorText};
  font-weight: normal;
  padding: ${lineHeightComputed} 0;

  @media ${smallOnly} {
    flex-direction: column;
    margin: 0;
  }
`;

const BrowserWarning = styled.p`
  padding: 0.5rem;
  border-width: ${borderSizeLarge};
  border-style: solid;
  border-radius: 0.25rem;
  margin: ${lineHeightComputed};
  text-align: center;
`;

const Title = styled.div`
  display: block;
  color: ${colorGrayDark};
  font-size: 1.4rem;
  text-align: center;
`;

const Footer = styled.div`
  display: flex;
`;

const Actions = styled.div`
  margin-left: auto;
  margin-right: ${borderSizeLarge};

  [dir="rtl"] & {
    margin-right: auto;
    background:red;
    margin-left: ${borderSizeLarge};
  }

  & > :first-child {
    margin-right: ${borderSizeLarge};
    margin-left: inherit;

    [dir="rtl"] & {
      margin-right: inherit;
      margin-left: ${borderSizeLarge};
    }
  }
`;

const ExtraActions = styled.div`
  margin-right: auto;
  margin-left: ${borderSizeLarge};

  [dir="rtl"] & {
    margin-left: auto;
    margin-right: ${borderSizeLarge};
  }

  & > :first-child {
    margin-left: ${borderSizeLarge};
    margin-right: inherit;

    [dir="rtl"] & {
      margin-left: inherit;
      margin-right: ${borderSizeLarge};
    }
  }
`;

const VideoPreviewModal = styled(Modal)`
  padding: 1rem;
  min-height: 25rem;
  max-height: 60vh;

  @media ${smallOnly} {
    height: unset;
    min-height: 22.5rem;
    max-height: unset;
  }

  ${({ isPhone }) => isPhone && `
    min-height: 100%;
    min-width: 100%;
    border-radius: 0;
  `}

  ${ModalStyles.Content} {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
`;

const ellipsis = keyframes`
  to {
    width: 1.5em;
  }
`;

const FetchingAnimation = styled.span`
  margin: auto;
  display: inline-block;
  width: 1.5em;

  &:after {
    overflow: hidden;
    display: inline-block;
    vertical-align: bottom;
    content: "\\2026"; /* ascii code for the ellipsis character */
    width: 0;
    margin-left: 0.25em;

    ${({ animations }) => animations && css`
      animation: ${ellipsis} steps(4, end) 900ms infinite;
    `}
  }
`;

const VideoPreview = styled.video`
  height: 100%;
  width: 100%;

  @media ${smallOnly} {
    height: 10rem;
  }

  ${({ mirroredVideo }) => mirroredVideo && `
    transform: scale(-1, 1);
  `}
`;

export default {
  Warning,
  Main,
  Text,
  Col,
  VideoCol,
  Label,
  Select,
  Content,
  BrowserWarning,
  Title,
  Footer,
  Actions,
  ExtraActions,
  VideoPreviewModal,
  FetchingAnimation,
  VideoPreview,
};
