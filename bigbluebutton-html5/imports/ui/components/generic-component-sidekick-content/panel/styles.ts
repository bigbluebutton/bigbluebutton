import styled from 'styled-components';
import {
  smPaddingX,
} from '../../../stylesheets/styled-components/general';
import {
  colorWhite,
} from '../../../stylesheets/styled-components/palette';

const GenericComponentSidebarContent = styled.div`
  background-color: ${colorWhite};
  padding: ${smPaddingX};
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: space-around;
  overflow: hidden;
  height: 100%;
  transform: translateZ(0);
`;

export default {
  GenericComponentSidebarContent,
};
