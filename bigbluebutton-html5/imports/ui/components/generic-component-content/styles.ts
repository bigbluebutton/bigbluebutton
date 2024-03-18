import styled from 'styled-components';

type ContainerProps = {
  numberOfTiles: number;
  isResizing: boolean;
  isMinimized: boolean;
};

export const Container = styled.div<ContainerProps>`
  position: absolute;
  pointer-events: inherit;
  background: var(--color-black);
  z-index: 5;
  display: grid;
  ${({ numberOfTiles }) => {
    if (numberOfTiles > 1) return 'grid-template-columns: 1fr 1fr;';
    return 'grid-template-columns: 1fr';
  }}
  grid-template-columns: 1fr 1fr;
  ${({ isResizing }) => isResizing && `
    pointer-events: none;
  `}
  ${({ isMinimized }) => isMinimized && `
    display: none;
  `}
`;

export default {
  Container,
};
