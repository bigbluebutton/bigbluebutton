import styled from 'styled-components';
import {
  toolbarButtonColor,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeLarger,
} from '/imports/ui/stylesheets/styled-components/typography';
import Button from '/imports/ui/components/common/button/component';

const PanTool = styled(Button)`
  border: none !important;
  padding: 0;
  margin: 0;
  border-radius: 7px;
  background-color: ${colorWhite};
  color: ${toolbarButtonColor};

  & > i {
    font-size: ${fontSizeLarger} !important;
    [dir="rtl"] & {
      -webkit-transform: scale(-1, 1);
      -moz-transform: scale(-1, 1);
      -ms-transform: scale(-1, 1);
      -o-transform: scale(-1, 1);
      transform: scale(-1, 1);
    }
  }

  &:hover,
  &:focus {
    background-color: var(--colors-hover);
  }
`;

export default {
  PanTool,
};
