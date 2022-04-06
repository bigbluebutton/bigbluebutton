import styled from 'styled-components';
import {
  borderSizeLarge,
  borderSize,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorWhite,
  colorGrayDark,
} from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';

const ConvertAndUpload = styled(Button)`
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
  ConvertAndUpload,
};
