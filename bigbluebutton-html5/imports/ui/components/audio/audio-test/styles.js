import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';

const TestAudioButton = styled(Button)`
  margin: 0 !important;
  background-color: transparent;
  color: ${colorPrimary};
  font-weight: normal;
  border: none;

  i {
    color: ${colorPrimary};

    ${({ animations }) => animations && `
      transition: all .2s ease-in-out;
    `}
  }

  &:hover,
  &:focus,
  &:active {
    border: none;
    background-color: transparent !important;
    color: #0c5cb2 !important;
    i {
      color: #0c5cb2;
    }
  }
`;

export default {
  TestAudioButton,
};
