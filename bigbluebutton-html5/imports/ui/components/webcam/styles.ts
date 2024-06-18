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
    & > div span div {
      &:hover {
        background-color: rgba(255, 255, 255, .3);
      }
      width: 100% !important;
    }
  `}

  ${({ $vertical }) => $vertical && css`
    & > div span div {
      &:hover {
        background-color: rgba(255, 255, 255, .3);
      }
      height: 100% !important;
    }
  `}
`;

export default {
  Draggable,
  ResizableWrapper,
};
