import styled from 'styled-components';
import { colorBlackSurface } from '/imports/ui/stylesheets/styled-components/palette';

type ContainerProps = {
  preventInteraction: boolean;
  isMinimized: boolean;
};

export const Container = styled.div<ContainerProps>`
  position: absolute;
  pointer-events: inherit;
  background: ${colorBlackSurface};
  z-index: 5;
  display: grid;
  ${({ preventInteraction }) => preventInteraction && `
    pointer-events: none;
  `}
  ${({ isMinimized }) => isMinimized && `
    display: none;
  `}
`;

export default {
  Container,
};
