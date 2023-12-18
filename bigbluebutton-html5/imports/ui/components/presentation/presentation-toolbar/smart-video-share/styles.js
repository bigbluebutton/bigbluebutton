import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';

const QuickVideoButton = styled(Button)`
  margin-left: .5rem;

  i {
    color: unset;
    font-size: 1rem;
    padding-left: 20%;
    right: 2px;

    [dir="rtl"] & {
      -webkit-transform: scale(-1, 1);
      -moz-transform: scale(-1, 1);
      -ms-transform: scale(-1, 1);
      -o-transform: scale(-1, 1);
      transform: scale(-1, 1);
    }
  }
`;

export default {
  QuickVideoButton,
};
