import styled from 'styled-components';
import ButtonEmoji from '/imports/ui/components/common/button/button-emoji/ButtonEmoji';

const AudioDropdown = styled(ButtonEmoji)`
  span {
    i {
      width: 0px !important;
      bottom: 1px;
    }
  }
`;

export default {
  AudioDropdown,
};
