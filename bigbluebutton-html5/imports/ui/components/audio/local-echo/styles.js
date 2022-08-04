import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import {
  colorPrimary,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';

const LocalEchoTestButton = styled(Button)`
  margin: 0 !important;
  font-weight: normal;
  border: none !important;

  &:hover {
    color: #0c5cb2;
  }

  i {
    ${({ animations }) => animations && `
      transition: all .2s ease-in-out;
    `}
  }

  background-color: transparent !important;
  color: ${colorPrimary} !important;

  ${({ $hearing }) => $hearing && `
    background-color: ${colorPrimary} !important;
    color: ${colorWhite} !important;
  `}
`;

export default {
  LocalEchoTestButton,
};
