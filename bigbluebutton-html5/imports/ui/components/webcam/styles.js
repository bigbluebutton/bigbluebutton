import styled from 'styled-components';

const Draggable = styled.div`
  ${({ isDraggable }) => isDraggable && `
    & > video {
      cursor: grabbing;
    }
  `}

  ${({ isDragging }) => isDragging && `
    background-color: rgba(200, 200, 200, 0.5);
  `}
`;

const ResizableWrapper = styled.div`
  ${({ horizontal }) => horizontal && `
    & > div span div {
      &:hover {
        background-color: rgba(255, 255, 255, .3);
      }
      width: 100% !important;
    }
  `}

  ${({ vertical }) => vertical && `
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
