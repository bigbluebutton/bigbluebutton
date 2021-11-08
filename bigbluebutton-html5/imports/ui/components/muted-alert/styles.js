import styled from 'styled-components';
import { mdPaddingX, borderRadius } from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeXL,
  fontSizeMD,
  fontSizeSmall,
} from '/imports/ui/stylesheets/styled-components/typography';
import { colorWhite, colorTipBg } from '/imports/ui/stylesheets/styled-components/palette';
import { smallOnly, mediumOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const MuteWarning = styled.div`
  position: absolute !important;
  color: ${colorWhite};
  background-color: ${colorTipBg};
  text-align: center;
  line-height: 1;
  font-size: ${fontSizeXL};
  padding: ${mdPaddingX};
  border-radius: ${borderRadius};
  top: -100%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  cursor: pointer;

  > span {
    white-space: nowrap;
  }

  @media ${smallOnly} {
    font-size: ${fontSizeMD};
  }

  ${({ alignForMod }) => alignForMod && `
    left: 72.25%;

    [dir="rtl"] & {
      left: 20%;
    }

    @media ${mediumOnly} {
      font-size: ${fontSizeSmall};
    }
  `}

  ${({ alignForViewer }) => alignForViewer && `
    left: 80%;
  
    [dir="rtl"] & {
      left: 20%;
    }

    @media ${mediumOnly} {
      font-size: ${fontSizeSmall};
    }

  `}
`;

export default {
  MuteWarning,
};
