import * as React from 'react';
import { useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import Styled from './styles';

interface FloatingWindowProps {
  left: number;
  top: number;
  key: string;
  backgroundColor: string;
  boxShadow: string;
  isDraggable: boolean;
  renderFunction: (element: HTMLElement) => void;
}

const renderComponent = (
  elementRef: React.MutableRefObject<null>,
  key: string,
  top: number,
  left: number,
  backgroundColor: string,
  boxShadow: string,
) => (
  <Styled.FloatingWindowContent
    ref={elementRef}
    id={key}
    style={{
      top,
      left,
      backgroundColor,
      boxShadow,
    }}
  />
);

const FloatingWindow: React.FC<FloatingWindowProps> = ({
  left,
  top,
  key,
  backgroundColor,
  boxShadow,
  isDraggable,
  renderFunction,
}: FloatingWindowProps) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current && renderFunction) {
      renderFunction(elementRef.current);
    }
  }, [elementRef]);

  const componentToRender = renderComponent(
    elementRef,
    key,
    top,
    left,
    backgroundColor,
    boxShadow,
  );

  return (
    isDraggable
      ? (
        <Draggable>
          {componentToRender}
        </Draggable>
      ) : componentToRender
  );
};

export default FloatingWindow;
