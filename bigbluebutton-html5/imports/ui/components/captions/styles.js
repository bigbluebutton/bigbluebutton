import styled from 'styled-components';
import {
  colorWhite,
  colorGrayDark,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  mdPaddingX,
  mdPaddingY,
  pollHeaderOffset,
  toastContentWidth,
  borderSize,
  borderSizeLarge,
} from '/imports/ui/stylesheets/styled-components/general';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { DivElipsis } from '/imports/ui/stylesheets/styled-components/placeholders';
import Button from '/imports/ui/components/common/button/component';

const Captions = styled.div`
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

  & > button, & > button:hover {
    max-width: ${toastContentWidth};
  }
`;

const HideBtn = styled(Button)`
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

export default {
  Captions,
  Header,
  Title,
  HideBtn,
};
