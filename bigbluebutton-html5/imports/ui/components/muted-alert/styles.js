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
  z-index: 100;
  cursor: pointer;

  > span {
    white-space: nowrap;
  }

  @media ${smallOnly} {
    font-size: ${fontSizeMD};
  }

  @media ${mediumOnly} {
    font-size: ${fontSizeSmall};
  }

  ${({ $mobile }) => $mobile && `
    transform: translate(0, -50%);

    [dir="rtl"] & {
      right: 0;
    }

    [dir="ltr"] & {
      left: 0;
    }
  `}

  ${({ $mobile }) => !$mobile && `
    [dir="rtl"] & {
      transform: translate(50%, -50%);
    }

    [dir="ltr"] & {
      transform: translate(-50%, -50%);
    }
  `}
`;

export default {
  MuteWarning,
};
