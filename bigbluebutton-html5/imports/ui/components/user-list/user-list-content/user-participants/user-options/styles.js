import styled from 'styled-components';

import Button from '/imports/ui/components/common/button/component';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';

const OptionsButton = styled(Button)`
  border-radius: 50%;
  display: block;
  padding: 0;
  margin: 0 0.25rem;

  span {
    padding: inherit;
  }

  i {
    font-size: ${fontSizeBase} !important;
  }
`;

export default {
  OptionsButton,
};
