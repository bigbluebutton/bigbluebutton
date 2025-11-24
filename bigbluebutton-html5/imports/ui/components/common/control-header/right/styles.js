import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';

const CloseButton = styled(Button)`
  ${({ disabled }) => disabled && `
    opacity: .5;
    box-shadow: none;
    span:first-of-type {
      &:hover {
        background-color: transparent !important;
      }
    }
    &:hover {
      cursor: not-allowed;
    }
  `}
  span:first-of-type {
    padding: 0;
    margin: 0;

    & > i,
    & > i::before {
      width: auto;
      font-size: ${fontSizeBase};
    }
  }
`;

export default { CloseButton };
