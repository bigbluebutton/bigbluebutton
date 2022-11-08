import styled from 'styled-components';
import {
  colorWhite,
  colorGrayDark,
} from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';

const ConvertAndUpload = styled(Button)`
  position: relative;
  background-color: ${colorWhite};
  display: block;
  padding: 0;
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
