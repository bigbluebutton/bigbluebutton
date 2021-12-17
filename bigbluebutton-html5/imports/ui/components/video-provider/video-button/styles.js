import styled from 'styled-components';
import Button from '/imports/ui/components/button/component';

const VideoButton = styled(Button)`
  ${({ ghost }) => ghost && `
    & > span {
      box-shadow: none;
      background-color: transparent !important;
      border-color: var(--color-white) !important;
    }
  `}
`;

const OffsetBottom = styled.div`
  top: auto !important;
  bottom: 4rem !important;
`;

export default {
  VideoButton,
  OffsetBottom,
};
