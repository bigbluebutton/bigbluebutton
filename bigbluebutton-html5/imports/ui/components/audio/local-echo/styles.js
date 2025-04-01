import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import {
  colorPrimary,
  btnMutedBg,
} from '/imports/ui/stylesheets/styled-components/palette';

const LocalEchoTestButton = styled(Button)`
  height: 2rem;
  width: 100%;

  &:hover {
    background-color: ${btnMutedBg} !important
  }

  i {
    ${({ animations }) => animations && `
      transition: all .2s ease-in-out;
    `}
  }

  background-color: transparent !important;
  color: ${colorPrimary} !important;
`;

export default {
  LocalEchoTestButton,
};
