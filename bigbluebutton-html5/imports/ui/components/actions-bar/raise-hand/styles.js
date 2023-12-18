import styled from 'styled-components';
import ButtonEmoji from '/imports/ui/components/common/button/button-emoji/ButtonEmoji';

const HideDropdownButton = styled(ButtonEmoji)`
  span {
    i {
      width: 0px !important;
      bottom: 1px;
    }
  }
`;

const OffsetBottom = styled.div`
  position: relative;
`;

export default {
  HideDropdownButton,
  OffsetBottom,
};
