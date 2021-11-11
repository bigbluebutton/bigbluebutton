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

export default {
  VideoButton,
};
