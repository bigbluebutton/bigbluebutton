import styled from 'styled-components';
import { colorTransparent } from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';

const Wrapper = styled.div`
  background-color: ${colorTransparent};
  cursor: pointer;
  border: 0;
  z-index: 2;
  margin: 2px;
`;

const ReloadButton = styled(Button)`
  &,
  &:active,
  &:hover,
  &:focus {
    border: none !important;

    i {
      border: none !important;
      background-color: ${colorTransparent} !important;
    }
  }
  padding: 5px;

  &:hover {
    border: 0;
  }

  i {
    font-size: 1rem;
  }
`;

export default {
  Wrapper,
  ReloadButton,
};
