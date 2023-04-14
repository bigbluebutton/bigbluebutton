import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';

const QuickLinkButton = styled(Button)`
  width: 35px !important;
  height: 45px !important;

  i {
    font-size: 1rem;
    padding-left: 20%;
    right: 3px;
    [dir="rtl"] & {
      left: 3px;
      right: 0px;
      -webkit-transform: scale(-1, 1);
      -moz-transform: scale(-1, 1);
      -ms-transform: scale(-1, 1);
      -o-transform: scale(-1, 1);
      transform: scale(-1, 1);
    }
  }
`;

export default {
  QuickLinkButton,
};