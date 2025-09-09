import styled, { css } from 'styled-components';

const Draggable = styled.div<{
  $isDraggable: boolean;
  $isDragging: boolean;
}>`
  ${({ $isDraggable }) => $isDraggable && css`
    & > video {
      cursor: grabbing;
    }
  `}

  ${({ $isDragging }) => $isDragging && css`
    background-color: rgba(200, 200, 200, 0.5);
  `}
`;

const ResizableWrapper = styled.div<{
  $horizontal: boolean;
  $vertical: boolean;
}>`
  ${({ $horizontal }) => $horizontal && css`
    & > div div[style*="user-select: none"]:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }
  `}

  ${({ $vertical }) => $vertical && css`
    & > div div[style*="user-select: none"]:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }
  `}
`;

export default {
  Draggable,
  ResizableWrapper,
};
