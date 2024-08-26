import styled, { css, keyframes } from 'styled-components';
import {
  borderSizeSmall,
  borderSize,
  borderSizeLarge,
  mdPaddingX,
  titlePositionLeft,
  lgPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorGrayLabel,
  colorWhite,
  colorBlack,
  colorGrayLighter,
  colorGrayLightest,
  colorPrimary,
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeLarge,
  lineHeightComputed,
  headingsFontWeight,
  fontSizeLarger,
  fontSizeSmall,
} from '/imports/ui/stylesheets/styled-components/typography';
import { smallOnly, mediumOnly, landscape } from '/imports/ui/stylesheets/styled-components/breakpoints';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import ModalStyles from '/imports/ui/components/common/modal/simple/styles';
import Button from '/imports/ui/components/common/button/component';
import {
  Tab, Tabs, TabList,
} from 'react-tabs';

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

  @media ${smallOnly}, ${mediumOnly} {
    justify-content: space-between;
    align-items: center;
    overflow: auto;
    margin: 0;
  }
`;

const BgnCol = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  margin: 0 0.5rem 0 0.5rem;

  @media ${smallOnly} {
    justify-content: space-between;
    align-items: center;
    margin: 0;
  }
`;

const InternCol = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  margin: 0 0.5rem 0 0.5rem;

  @media ${smallOnly} {
    width: 90%;
  }
`;

const ContentCol = styled.div`
  width: 60%;
  height: 25vh;

  @media ${smallOnly} {
    width: 90%;
  }
`;

const BackgroundCol = styled.div`
  display: flex;
  flex-direction: column;
`;

const VideoCol = styled(Col)`
  align-items: center;

  @media ${landscape} {
     width: 50%;
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
  
  color: ${colorText};
  font-weight: normal;

  @media ${smallOnly} {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    margin: 5px;
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

const Footer = styled.div`
  display: flex;
  flex-direction: column;
`;

const FooterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${({ showStopAllButton }) => (showStopAllButton ? 'flex-start' : 'flex-end')};

  @media ${smallOnly} {
    display: flex;
    flex-direction: column;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;

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

const VideoPreviewModal = styled(ModalSimple)`
  padding: 1rem;
  min-height: 25rem;
  max-height: 100vh;

  @media ${smallOnly} {
    height: unset;
    min-height: 22.5rem;
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

const Background = styled.span`
  ${({ isBlurred }) => isBlurred
    && css`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(10px);
    z-index: 998;
    `}
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

const Marker = styled.div`
  width: 2rem;
  text-align: center;
`;

const MarkerDynamic = styled(Marker)`
  position: absolute;
  top: 0;
`;

const MarkerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  user-select: none;
`;

const MarkerDynamicWrapper = styled.div`
  position: relative;
  height: 1rem;
  user-select: none;
`;

const Container = styled.div`
  padding: 0 calc(${mdPaddingX} / 2 + ${borderSize});
`;

const Header = styled.div`
  margin: 0;
  padding: 0;
  border: none;
  line-height: ${titlePositionLeft};
  margin-bottom: ${lgPaddingY};
`;

const WebcamTabs = styled(Tabs)`
  display: flex;
  flex-flow: column;

  &:hover {
    cursor: pointer;
  }

`;

const WebcamTabList = styled(TabList)`
  display: flex;
  justify-content: space-around;
  padding: 0;
  list-style-type: none;
`;

const WebcamTabSelector = styled(Tab)`
  display: flex;
  justify-content: center;
  flex-grow: 1;
  text-align: center;
  font-weight: bold;
  color: ${colorGrayLighter};

  &.is-selected {
    border: none;
    color: ${colorBlack};
  }
`;

const HeaderSeparator = styled.div`
  border-left: 1px solid ${colorText};
  content: '|';
  margin: 0 1.5rem; 
  height: 1.5rem;
  align-self: center;
  opacity: 0.75;
`;

const BottomSeparator = styled.div`
  position: relative;
  width: 100%;
  height: ${borderSizeSmall};
  background-color: ${colorGrayLightest};
  margin-top: calc(${lineHeightComputed} * 1.25);
  margin-bottom: calc(${lineHeightComputed} * 1.25);
`;

const IconSvg = styled.img`
  height: ${fontSizeLarger};
  border-radius: 5px;
  margin: 5px;

  ${({ darkThemeState }) => darkThemeState && css`
      filter: invert(1);
    `}

`;

const SharingButton = styled(Button)`
  margin: 0 0.5rem;
  height: 2.5rem;
`;

const CancelButton = styled(Button)`
  margin: 0 0.5rem;
  height: 2.5rem;
`;

const StopAllButton = styled(Button)`
  margin: 0 0.5rem;
  height: 2.5rem;
`;

export default {
  Warning,
  Main,
  Text,
  Col,
  BgnCol,
  ContentCol,
  InternCol,
  Container,
  Header,
  WebcamTabs,
  WebcamTabList,
  WebcamTabSelector,
  HeaderSeparator,
  BottomSeparator,
  VideoCol,
  BackgroundCol,
  IconSvg,
  SharingButton,
  CancelButton,
  StopAllButton,
  Label,
  Select,
  Content,
  BrowserWarning,
  Background,
  Footer,
  FooterContainer,
  Actions,
  ExtraActions,
  VideoPreviewModal,
  FetchingAnimation,
  VideoPreview,
  Marker,
  MarkerDynamic,
  MarkerWrapper,
  MarkerDynamicWrapper,
};
