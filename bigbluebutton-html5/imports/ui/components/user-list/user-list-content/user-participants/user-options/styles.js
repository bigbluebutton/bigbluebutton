import styled from 'styled-components';

import Button from '/imports/ui/components/button/component';
import { colorOffWhite, colorGrayDark } from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';

const OptionsButton = styled(Button)`
  border-radius: 50%;
  display: block;
  padding: 0;

  i {
    width: auto;
    font-size: ${fontSizeBase} !important;
    color: ${colorGrayDark} !important;
    background-color: transparent !important;
  }

  &:hover,
  &:focus {
    background-color: ${colorOffWhite} !important;
  }
`;

export default {
  OptionsButton,
};
