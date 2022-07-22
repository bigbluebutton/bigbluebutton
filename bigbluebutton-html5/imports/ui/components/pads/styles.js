import styled from 'styled-components';
import {
  smPaddingX,
  lgPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorGray,
  colorGrayLightest,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';

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

const Pad = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

const IFrame = styled.iframe`
  width: 100%;
  height: auto;
  overflow: hidden;
  border-style: none;
  border-bottom: 1px solid ${colorGrayLightest};

  padding-bottom: 5px;
`;

export default {
  Hint,
  Pad,
  IFrame,
};
