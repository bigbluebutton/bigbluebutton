import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

const VideoButton = styled(Button)`
  ${({ ghost }) => ghost && `
    & > span {
      box-shadow: none;
      background-color: transparent !important;
      border-color: ${colorWhite} !important;
    }
  `}
`;

const OffsetBottom = styled.div`
  position: relative;
`;

export default {
  VideoButton,
  OffsetBottom,
};
