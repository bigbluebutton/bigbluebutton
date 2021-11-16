import styled from 'styled-components';
import {
  mdPaddingX,
  mdPaddingY,
  pollHeaderOffset,
  toastContentWidth,
  borderSizeLarge,
  borderSize,
  smPaddingX,
  lgPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorWhite,
  colorGrayDark,
  colorGray,
  colorGrayLightest,
} from '/imports/ui/stylesheets/styled-components/palette';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { DivElipsis } from '/imports/ui/stylesheets/styled-components/placeholders';
import { fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';
import Button from '/imports/ui/components/button/component';

const Note = styled.div`
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

const Title = styled(DivElipsis)`
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

const Hint = styled.span`
  visibility: hidden;
  position: absolute;

  @media (pointer: none) {
    visibility: visible;
    position: relative;
    color: ${colorGray};
    font-size: ${fontSizeSmall};
    font-style: italic;
    padding: ${smPaddingX} 0 0 ${smPaddingX};
    text-align: left;

    [dir="rtl"] & {
      padding-right: ${lgPaddingY} ${lgPaddingY} 0 0;
      text-align: right;
    }
  }
`;

const IFrame = styled.iframe`
  display: flex;
  flex-flow: column;
  flex-grow: 1;
  flex-shrink: 1;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  border-style: none;
  border-bottom: 1px solid ${colorGrayLightest};
`;

export default {
  Note,
  Header,
  Title,
  HideButton,
  Hint,
  IFrame,
};
