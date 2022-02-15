import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';

const CloseButton = styled(Button)`
  z-index: 1;
  position: absolute;
  top: 0;
  left: auto;
  cursor: pointer;
  margin: 2px;

  ${({ isIphone }) => isIphone && `
    right: 0;

    [dir="rtl"] & {
      right: auto;
      left: 0;
    }
  `}

  ${({ isIphone }) => !isIphone && `
    right: 40px;

    [dir="rtl"] & {
      right: auto;
      left: 40px;
    }
  `}
`;

export default {
  CloseButton,
};
