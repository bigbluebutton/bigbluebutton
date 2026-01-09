import styled from 'styled-components';

type ContainerProps = {
  isResizing: boolean;
  isMinimized: boolean;
};

export const Container = styled.div<ContainerProps>`
  position: absolute;
  pointer-events: inherit;
  background: var(--color-black);
  z-index: 5;
  display: grid;
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
