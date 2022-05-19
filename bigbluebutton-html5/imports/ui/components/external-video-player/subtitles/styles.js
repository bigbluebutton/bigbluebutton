import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';

import { colorTransparent } from '/imports/ui/stylesheets/styled-components/palette';

const SubtitlesWrapper = styled.div`
  background-color: ${colorTransparent};
  cursor: pointer;
  border: 0;
  z-index: 2;
  margin: 2px;

  [dir="rtl"] & {
    right: 0;
    left : auto;
  }
`;

const SubtitlesButton = styled(Button)`
  &,
  &:active,
  &:hover,
  &:focus {
    border: none !important;

    i {
      border: none !important;
      background-color: ${colorTransparent} !important;
    }
  }

  padding: 5px;

  &:hover {
    border: 0;
  }

  i {
    font-size: 1rem;
  }
`;

export default {
  SubtitlesWrapper,
  SubtitlesButton,
};
