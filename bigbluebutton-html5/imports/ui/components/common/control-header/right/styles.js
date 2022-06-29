import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

const CloseButton = styled(Button)`
  span:first-of-type {
    padding: 0;
    margin: 0;

    & > i,
    & > i::before {
      width: auto;
      font-size: ${fontSizeBase};
    }

    &:hover,
    &:focus,
    .buttonWrapper:hover &,
    .buttonWrapper:focus & {
      background-color: ${colorWhite} !important;
    }
  }
`;

export default { CloseButton };
