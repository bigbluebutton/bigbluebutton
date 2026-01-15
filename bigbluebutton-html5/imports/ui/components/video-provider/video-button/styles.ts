import styled from 'styled-components';
import ButtonEmoji from '/imports/ui/components/common/button/button-emoji/ButtonEmoji';

const OffsetBottom = styled.div`
  position: relative;
`;

// @ts-ignore - as button comes from JS, we can't provide its props
export const VideoDropdown = styled(ButtonEmoji)`
  span {
    i {
      width: 98% !important;
    }
  }
`;

export default {
  OffsetBottom,
  VideoDropdown,
};
